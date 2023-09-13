import React from 'react';
import icon1 from '../icon/Icon1.svg';
import icon2 from '../icon/Icon2.svg';
import icon3 from '../icon/Icon3.svg';
import icon4 from '../icon/Icon4.svg';


const Step = ({ number }) => {
    const elements = {
        "1": {
            "icon": icon1,
            "title": "1. Задай параметры поиска",
            "description": "Настройте поиск по своим предпочтениям и найдите идеальное жилье и экскурсии по душе."
        },
        "2": {
            "icon": icon2,
            "title": "2. Найди лучший вариант",
            "description": "Выберите свое идеальное жилье или экскурсию среди множества вариантов с разных площадок."
        },
        "3": {
            "icon": icon3,
            "title": "3. Забронируй",
            "description": "Оформите бронирование понравившегося варианта на сайте поставщика услуги."
        },
        "4": {
            "icon": icon4,
            "title": "4. Путешествуй",
            "description": "Отправляйтесь в незабываемое путешествие, наслаждаясь каждой минутой."
        }
    }

    return (
    <div className="step" id={"step" + number}>
        <img alt="Шаг" src={elements[number]["icon"]} />
        <div className="step_description">
            <div className="step_title">{elements[number]["title"]}</div>
            <div className="step_text">{elements[number]["description"]}</div>
        </div>
    </div>
    )
}

export default Step;