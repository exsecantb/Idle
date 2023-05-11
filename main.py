import db
import amplitude as amp
import scraper as scr

import logging
import gc
from datetime import datetime, timedelta

from aiogram.types import ReplyKeyboardRemove, ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardButton, InlineKeyboardMarkup, FSInputFile
from aiogram import types, Bot, Dispatcher
from aiogram.types.web_app_info import WebAppInfo
from aiogram.filters import Command
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.utils.markdown import link
import aioschedule

import asyncio


TOKEN = "TOKEN"

storage = MemoryStorage()
bot = Bot(token=TOKEN)
dp = Dispatcher(storage=storage)


# Configure logging
logging.basicConfig(level=logging.INFO)


class UserS(StatesGroup):
    Info = State()
    Search = State()
    Gift = State()


# Клавиатура с WebApp
web_kb = ReplyKeyboardMarkup(resize_keyboard=True, is_persistent=True, keyboard=[[KeyboardButton(text="Параметры поиска 🏡", web_app=WebAppInfo(url="https://search.idlebot.ru"), )]])


@dp.message(Command(commands=["start"]))
async def start(message: types.Message) -> None:
    # Регистрация в базе данных
    registered = await db.register_user(message.from_user.username, message.chat.id)
    if registered:
        # Амплитуда
        amp.new_user(message.chat.id, message.from_user.username, message.from_user.is_premium, message.from_user.language_code)
        #
        await message.answer("🕊 Привет! Меня зовут idleBot, предлагаю лучшие варианты жилья посуточно со скидкой от 3%.\n\nПросто жми 🟰Menu и снизу кнопку Параметры поиска 🏡, следуй моим подсказкам!", reply_markup=ReplyKeyboardRemove())
        await asyncio.sleep(1)
        await message.answer("Подробнее обо мне можно узнать выбрав команду /help\nОформи подписку по цене *99 руб/мес* (☕️) и получи премиальные условия!", reply_markup=web_kb)


# Хендлер WebApp Data
@dp.message(lambda message: message.web_app_data)
async def message_handler(message: types.message, state: FSMContext) -> None:
    stic = await bot.send_sticker(message.chat.id, "CAACAgIAAxkBAAEGqf1ji1YqGJ5ytJe9sYcrIB0NZIe0vgACeCYAAoOxWEivtM3UgWHuvCsE", reply_markup=ReplyKeyboardRemove())
    await asyncio.sleep(1)
    mes = await message.answer("Ищем подходящие варианты...\nОжидание может занять до 1 минуты, но обычно мы справляемся ещё быстрее 💪", reply_markup=ReplyKeyboardRemove())
    # Получение данных от WebApp
    data = message.web_app_data.data
    # Амплитуда
    amp.search_request(message.chat.id, message.from_user.username)
    # Парсинг
    if data[0] == '!' or data[:5] == 'AVIA!':
        query = str(data).replace('AVIA', '')
        source = await scr.ostrovok_get(query, message.from_user.username)
        await state.update_data(service="Островок")  # Сервис
    else:
        query = str(data).replace('AVIA', '')
        source = await scr.browser_get(query, message.from_user.username)
        await state.update_data(service="Суточно")  # Сервис
    await bot.delete_message(message.chat.id, mes.message_id)
    await bot.delete_message(message.chat.id, stic.message_id)
    if source[0] == 0:  # Ошибка поиска
        # Амплитуда
        amp.search_error(message.chat.id, message.from_user.username)
        #
        await bot.send_message(718190318, f"@{message.from_user.username} - {source[1]}")
        await message.answer("База не отвечает, чиним! ⏰", reply_markup=ReplyKeyboardRemove())
    elif source[0] == 2:  # Нет результатов
        # Амплитуда
        amp.no_results(message.chat.id, message.from_user.username)
        #
        await message.answer("Кажется, по твоим параметрам ничего не нашлось 😣 Попробуй расширить радиус поиска или изменить фильтры!", reply_markup=web_kb)
    else:
        # В случае успешного поиска и отсутствия подписки - снизить лимит
        if not (await db.check_payment(message.chat.id)):
            await db.update_limit(message.chat.id, message.from_user.username)
        cards = source[0]
        gc.collect()
        await state.update_data(cards=cards)  # Карточки
        await state.update_data(current=0)  # Текущая карточка
        await state.update_data(all=len(cards) - 1)  # Всего карточек в запросе
        # Амплитуда
        amp.search_success(message.chat.id, message.from_user.username, len(cards), source[2], source[3], source[4], source[5])
        #
        inb = InlineKeyboardButton(text='Показать варианты  ⬇', callback_data='Показать варианты')
        message_text = f"*Мы нашли и отобрали для тебя {len(cards)} лучших вариантов жилья! Жми ⬇️*"
        if 'AVIA' in data:
            message_text += "\n\nА чтобы быстро найти дешевые авиабилеты, просто нажми на кнопку ✈️ и следуй нашим подсказкам 😉"
            inb2 = InlineKeyboardButton(text='Поиск авиабилетов  ✈️', url='https://t.me/IdleAvia_bot')
            inkb = InlineKeyboardMarkup(inline_keyboard=[[inb], [inb2]])
        else:
            inkb = InlineKeyboardMarkup(inline_keyboard=[[inb]])
        await bot.send_message(message.chat.id, message_text, reply_markup=inkb)


@dp.callback_query(lambda call: call.data == "Показать варианты")
async def show_results(callback_query: types.CallbackQuery, state: FSMContext):
    user_data = await state.get_data()
    if len(user_data) != 0:  # Проверка, если бот выключался
        cards = user_data['cards']
        # Амплитуда
        amp.show_results(callback_query.message.chat.id, callback_query.message.from_user.username, len(cards))
        # Удаляем кнопку с "Показать"
        try:
            await callback_query.message.edit_reply_markup(InlineKeyboardMarkup(inline_keyboard=[[callback_query.message.reply_markup.inline_keyboard[1][0]]]))
        except Exception:
            await callback_query.message.delete_reply_markup()
        # Клавиатура
        inb1 = InlineKeyboardButton(text='Показать ещё  ➡', callback_data='Ещё')
        inb2 = InlineKeyboardButton(text='Подробнее', web_app=WebAppInfo(url=cards[0]['url']))
        inb3 = InlineKeyboardButton(text='На карте 📍', callback_data=cards[0]['location'])
        if len(cards) == 1:  # Если результат всего один
            inkb = InlineKeyboardMarkup(inline_keyboard=[[inb2], [inb3]])
        else:
            inkb = InlineKeyboardMarkup(inline_keyboard=[[inb2], [inb3, inb1]])
        # Генерация текста
        object_link = link('Источник ↗', cards[0]['url'])
        if user_data['service'] == 'Островок':
            stars = '⭐' * cards[0]['star']
            if stars != '': stars += '\n'
            text = stars + '*' + cards[0]['name'] + '*' + '\n\n' + '\n'.join(cards[0]['rooms']) + '\n\n📍 `' + cards[0]['address'] + '`\n\n' + object_link + '\n_ℹ Гарантия кэшбэка только при оплате брони по ссылке!_'
        else:
            text = cards[0]['info'] + '\n' + '*' + cards[0]['name'] + '*\n\n' + cards[0]['atrs'] + '\n' + '📍 `' + cards[0]['address'] + '`\n\n' + '*' + cards[0]['price'] + '* в сутки ' + cards[0]['rate'] + ' ' + cards[0]['count'] + '\n\n' + object_link + '\n_ℹ Гарантия кэшбэка только при оплате брони по ссылке!_'
        # Генерация фото
        await callback_query.answer(text="Загружаем фотографии...")
        try:
            if len(cards[0]['photo']) > 0:
                photo = await scr.collage(cards[0]['photo'])
            else:
                photo = FSInputFile(f"./Pictures/Error.jpg")
        except Exception as e:  # В случае ошибки - заменить фото
            print(e)
            photo = FSInputFile(f"./Pictures/Error.jpg")
        # Отправка
        await bot.send_photo(callback_query.message.chat.id, photo, text, reply_markup=inkb)
        await state.update_data(current=1)
    else:
        await callback_query.message.delete_reply_markup()


@dp.callback_query(lambda call: call.data == "Ещё")  # Последующий поиск
async def show_results(callback_query: types.CallbackQuery, state: FSMContext):
    user_data = await state.get_data()
    if len(user_data) != 0:  # Проверка, если бот выключался
        cards = user_data['cards']
        num = user_data['current']
        # Удаляем кнопку "Ещё"
        await callback_query.message.edit_reply_markup(InlineKeyboardMarkup(inline_keyboard=[[callback_query.message.reply_markup.inline_keyboard[0][0]]]))
        if num < user_data['all']:  # Если не конец
            # Клавиатура
            inb1 = InlineKeyboardButton(text='Показать ещё  ➡', callback_data='Ещё')
            inb2 = InlineKeyboardButton(text='Подробнее', web_app=WebAppInfo(url=cards[num]['url']))
            inb3 = InlineKeyboardButton(text='На карте 📍', callback_data=cards[num]['location'])
            inkb = InlineKeyboardMarkup(inline_keyboard=[[inb2], [inb3, inb1]])
        else:  # Реально последний результат
            inb2 = InlineKeyboardButton(text='Подробнее', web_app=WebAppInfo(url=cards[num]['url']))
            inb3 = InlineKeyboardButton(text='На карте 📍', callback_data=cards[num]['location'])
            inkb = InlineKeyboardMarkup(inline_keyboard=[[inb2], [inb3]])
            # Очищаем массив карточек
            await state.update_data(cards=[])

        # Генерация текста
        object_link = link('Источник ↗', cards[num]['url'])
        if user_data['service'] == 'Островок':
            stars = '⭐' * cards[num]['star']
            if stars != '': stars += '\n'
            text = stars + '*' + cards[num]['name'] + '*' + '\n\n' + '\n'.join(cards[num]['rooms']) + '\n\n📍 `' + cards[num]['address'] + '`\n\n' + object_link + '\n_ℹ Гарантия кэшбэка только при оплате брони по ссылке!_'
        else:
            text = cards[num]['info'] + '\n' + '*' + cards[num]['name'] + '*\n\n' + cards[num]['atrs'] + '\n' + '📍 `' + cards[num]['address'] + '`\n\n' + '*' + cards[num]['price'] + '* в сутки ' + cards[num]['rate'] + ' ' + cards[num]['count'] + '\n\n' + object_link + '\n_ℹ Гарантия кэшбэка только при оплате брони по ссылке!_'
        # Генерация фото
        await callback_query.answer(text="Загружаем фотографии...")
        try:
            if len(cards[num]['photo']) > 0:
                photo = await scr.collage(cards[num]['photo'])
            else:
                photo = FSInputFile(f"./Pictures/Error.jpg")
        except Exception:  # В случае ошибки - заменить фото
            photo = FSInputFile(f"./Pictures/Error.jpg")
        # Отправка
        await bot.send_photo(callback_query.message.chat.id, photo, text, reply_markup=inkb)
        await state.update_data(current=num + 1)
        # Амплитуда
        amp.button_eche(callback_query.message.chat.id, callback_query.message.from_user.username)
    else:
        await callback_query.message.edit_reply_markup(InlineKeyboardMarkup(inline_keyboard=[[callback_query.message.reply_markup.inline_keyboard[0][0]]]))


@dp.callback_query(lambda call: "Сут@" in call.data)
async def location_sut(callback_query: types.CallbackQuery):
    result = scr.find_place(callback_query.data.split('@')[1])
    if result[0]:
        await callback_query.message.answer_location(result[1], result[2])
        # Амплитуда
        amp.show_location(callback_query.message.chat.id, callback_query.message.from_user.username)
        #
    try:
        await callback_query.message.edit_reply_markup(InlineKeyboardMarkup(inline_keyboard=[[callback_query.message.reply_markup.inline_keyboard[0][0]], [callback_query.message.reply_markup.inline_keyboard[1][1]]]))
    except Exception:
        await callback_query.message.edit_reply_markup(InlineKeyboardMarkup(inline_keyboard=[[callback_query.message.reply_markup.inline_keyboard[0][0]]]))
    await callback_query.answer()


@dp.callback_query(lambda call: "Ост@" in call.data)
async def location_ost(callback_query: types.CallbackQuery):
    await callback_query.message.answer_location(float(callback_query.data.split('@')[1]), float(callback_query.data.split('@')[2]))
    # Амплитуда
    amp.show_location(callback_query.message.chat.id, callback_query.message.from_user.username)
    #
    try:
        await callback_query.message.edit_reply_markup(InlineKeyboardMarkup(inline_keyboard=[[callback_query.message.reply_markup.inline_keyboard[0][0]], [callback_query.message.reply_markup.inline_keyboard[1][1]]]))
    except Exception:
        await callback_query.message.edit_reply_markup(InlineKeyboardMarkup(inline_keyboard=[[callback_query.message.reply_markup.inline_keyboard[0][0]]]))
    await callback_query.answer()


@dp.callback_query(lambda call: call.data == "Новый запрос")
async def show(callback_query: types.CallbackQuery):
    await callback_query.message.edit_reply_markup(InlineKeyboardMarkup(inline_keyboard=[[callback_query.message.reply_markup.inline_keyboard[0][0]]]))
    await callback_query.message.answer("Эта функция пока находится в разработке 🙇")
    await callback_query.answer()


@dp.message(Command(commands=["search"]))
async def search(message: types.Message) -> None:
    # Амплитуда
    amp.search_command(message.chat.id, message.from_user.username)
    #
    if not (await db.check_payment(message.chat.id)) and not (await db.check_limit(message.chat.id)):
        await message.answer("*Уфф... Кажется, лимит твоих запросов на сегодня достигнут* 🤒\n\nНажми /subscribe и подключи подписку или возвращайся к нам завтра!\n\n_* Без подписки ты можешь использовать поиск только 3 раза в день_", reply_markup=ReplyKeyboardRemove())
    else:
        await message.answer("Чтобы начать поиск с новыми настройками, нажми на кнопку *«Параметры поиска 🏡»*", reply_markup=web_kb)


@dp.message(Command(commands=["gift"]))
async def gift(message: types.Message, state: FSMContext) -> None:
    ...


@dp.message(Command(commands=["help"]))
async def help_com(message: types.Message) -> None:
    # Амплитуда
    amp.help_command(message.chat.id, message.from_user.username)
    #
    await message.answer("В *idleBot* ❤️ Вы сможете быстро находить жильё посуточно, с помощью удобного интерфейса выбирать лучшие варианты и бронировать понравившиеся с приятной скидкой для вас!\n\nДоступные команды бота:\n\n/search  —  🔎 Начать поиск\n/subscribe  —  🎁 Подписка\n/help  —  ℹ️ Подробнее о боте\n/cashback  —  💸 Как получить кешбэк 5%", reply_markup=ReplyKeyboardRemove())


@dp.message(Command(commands=["stat"]))
async def gift(message: types.Message) -> None:
    ...


@dp.message(Command(commands=["cashback"]))
async def gift(message: types.Message) -> None:
    # Амплитуда
    amp.cashback_command(message.chat.id, message.from_user.username)
    #
    await message.answer("При оформлении брони из бота нам зачисляется комиссия. Мы получаем деньги от платформы бронирования и *возвращаем кэшбэк 5%* удобным вам способом.\n\nКонтакт для связи с нами @igorstar77 💸", reply_markup=ReplyKeyboardRemove())


@dp.message(UserS.Gift)
async def gift(message: types.Message, state: FSMContext) -> None:
    ...


PRICE = types.LabeledPrice(label='Подписка на IdleBot', amount=9900)


@dp.message(Command(commands=["subscribe"]))
async def subscribe(message: types.Message) -> None:
    # Амплитуда
    amp.subscribe_command(message.chat.id, message.from_user.username)
    #
    checking = await db.check_payment(message.chat.id)
    if checking:
        current = await db.get_payment(message.chat.id)
        subs = f"*оплачено до {current}* ✅"
        limit = '♾'
    else:
        limit = await db.get_limit(message.chat.id)
        subs = "*не действует* ❌"
    await message.answer("В бесплатном режиме бот дает возможность делать 3 поисковых запроса в день.\n\n*Подключив ежемесячную подписку на IdleBot, ты сможешь смотреть квартиры без ограничений ⚡\nСтоимость подписки 99 руб./мес (дешевле чем хороший кофе ☕️). Примерно такая же сумма вернется тебе с кешбэком с первой же брони.*\n\nС неограниченным поиском будет проще:\n❤️ Находить лучшие варианты\n❤️ Обсуждать выбор вместе со своей компанией прямо в Телеграм\n❤️ Хранить любимые варианты в Media архиве в боте")
    await asyncio.sleep(1)
    await message.answer(f"Статус твоей подписки: {subs}\nОстаток запросов на текущий день: {limit}", reply_markup=ReplyKeyboardRemove())
    if not checking:
        await asyncio.sleep(1)
        dto = (datetime.now() + timedelta(30)).strftime("%Y-%m-%d")
        await bot.send_invoice(
            message.chat.id,
            title="Подписка на IdleBot",
            description=f"Подписка на 30 дней для использования бота без ограничений.\nБудет действовать по {dto} включительно.",
            provider_token="TOKEN",
            currency='rub',
            is_flexible=False,
            prices=[PRICE],
            payload='TOKEN'
        )


@dp.pre_checkout_query(lambda query: True)
async def process_pre_checkout_query(pre_checkout_query: types.PreCheckoutQuery):
    print('Принято')
    await bot.answer_pre_checkout_query(pre_checkout_query.id, ok=True)


@dp.message(lambda message: message.successful_payment)
async def process_successful_payment(message: types.message):
    print(f'Оплата от @{message.from_user.username}')
    # Амплитуда
    amp.payment(message.chat.id, message.from_user.username)
    #
    await bot.send_message(718190318, f"Оплата от @{message.from_user.username}")
    await db.update_payment(message.chat.id)
    curdata = await db.get_payment(message.chat.id)
    await bot.send_message(message.chat.id, "*Оплата произведена успешно*\nНаша команда благодарит тебя за поддержку 🙏", reply_markup=ReplyKeyboardRemove())
    await asyncio.sleep(1)
    await bot.send_message(message.chat.id, f"Теперь ты можешь просматривать квартиры без ограничений. Твоя подписка будет действовать до *{curdata}* включительно ⚡")


@dp.message(lambda message: 'Параметры поиска 🏡' in message.text)
async def help_mes2(message: types.message):
    if await db.check_payment(message.chat.id) or await db.check_limit(message.chat.id):
        await message.answer("❗ Чтобы бот работал корректно, пожалуйста, переключись на *Z*-версию _Telegram Web_ (Телеграм в браузере) и попробуй снова", reply_markup=web_kb)
        await asyncio.sleep(1)
        z_link = link('ссылке', 'https://web.telegram.org/z/')
        await message.answer(f"Это можно сделать нажав на *≡* сверху слева и выбрав опцию *«Switch to Z version»*\nили по {z_link}", reply_markup=web_kb)


@dp.message()
async def help_mes(message: types.Message) -> None:
    if await db.check_payment(message.chat.id) or await db.check_limit(message.chat.id):
        await message.answer("Чтобы начать новый поиск, открой *= Меню*, выбери команду /search и после - нажми кнопку *«Параметры поиска 🏡»* внизу экрана", reply_markup=web_kb)
    else:
        await message.answer("*Лимит запросов на сегодня достигнут* 🤒\n\nБез подписки ты можешь использовать поиск только 3 раза в день. Узнай больше по команде /subscribe или возвращайся к нам завтра!", reply_markup=ReplyKeyboardRemove())


@dp.shutdown()
async def on_shut():
    print("Бот выключен")


if __name__ == "__main__":
    bot.parse_mode = 'MARKDOWN'
    dp.run_polling(bot)
