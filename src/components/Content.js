import React from 'react';
import PageTitle from './PageTitle';
import Step from './Step';
import left_arrow from '../icon/LeftArrow.svg';
import right_arrow from '../icon/RightArrow.svg';
import Wrapper from './Wrapper';
import Widget from './Widget';
import pic1 from '../icon/bot1.jpg';
import pic2 from '../icon/bot2.jpg';
import Form from './Form';
import SearchButton from './SearchButton';


class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chapter: "1"
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedChapter !== this.props.selectedChapter) {
          this.setState({ chapter: this.props.selectedChapter });
        }
    }

    handleClick = () => {
        this.setState({ chapter: "3" });
        // Imitating click
        document.getElementById("chapter_3").click();
    }

    render() {
        const current = this.state.chapter;
        // First page
        let page = (<div className="content">
        <SearchButton onButtonClick={this.handleClick} className="top_button"/>
        <PageTitle title="Максимум приключений, минимум усилий" />
        <div className="steps_container">
            <Step number="1"/>
            <div className="right_arrow">
                <img alt="Шаг" src={right_arrow} />
            </div>
            <Step number="2"/>
            <div className="left_arrow">
                <img alt="Шаг" src={left_arrow} />
            </div>
            <Step number="3"/>
            <div className="right_arrow">
                <img alt="Шаг" src={right_arrow} />
            </div>
            <Step number="4"/>
        </div>
        <SearchButton onButtonClick={this.handleClick} className="search_button"/>
        <div className="title">Настрой свое путешествие вместе с Idle</div>
        <div className="description">Больше не нужно тратить время на поиск и сравнение различных предложений! Просто укажите свои предпочтения и мы сразу перейдем к подбору самых подходящих вариантов для вас.</div>
        <Wrapper />
        </div>
        )
        if (current === "2") {
            // Second page
            page = (<div className="content">
            <SearchButton onButtonClick={this.handleClick} className="tg_button1"/>
            <PageTitle title="Собрано со всех уголков: легкий поиск аренды жилья" />
            <div className="description" style={{marginTop: "19px"}}>Мы собираем объявления из разных источников, чтобы помочь вам сэкономить время и избежать неудобств, связанных со сложным устройством некоторых сайтов. Просто выберите нужный сервис аренды, укажите важные для вас параметры поиска и получите доступ к лучшим вариантам!</div>
            <Widget name="Idle" pic={pic1} title="Привет! Ищешь жилье? 🏠" text="Не теряй время, запусти бота прямо сейчас и найди свой идеальный вариант за считанные минуты!" link="https://t.me/idle1_bot"/>
            </div>
            )
        } else if (current === "3") {
            // Third page
            page = (<div className="content">
            <PageTitle title="Найдем экскурсии по вашим предпочтениям" />
            <div className="description" style={{marginTop: "19px"}}><a href="https://tripster.tp.st/sxiY24BS?erid=2VtzqwBWn2L" rel="noreferrer" target="_blank">Экскурсии</a> в июле–августе 2023 года в России для вашего вдохновения.</div>
            <Form authorizeValue={this.props.authorizeValue}/>
            </div>
            )
        } else if (current === "4") {
            // Fourth page
            page = (<div className="content">
            <SearchButton onButtonClick={this.handleClick} className="tg_button2"/>
            <PageTitle title="Поиск самых выгодных предложений" />
            <div className="description" style={{marginTop: "19px"}}>Просто введите свои пункты отправления и прибытия, выберите даты, и бот покажет вам лучшие варианты по самым низким ценам. Не теряйте времени на поиск, доверьтесь нам и сделайте свои путешествия более доступными!</div>
            <Widget name="Idle Avia" pic={pic2} title="Привет! Готов отправиться в новое приключение? ✈️" text="Не трать время на поиск дешевых авиабилетов. Запусти наш сервис и мгновенно найди идеальный вариант для своей поездки!" link="https://t.me/IdleAvia_bot"/>
            </div>
            )
        }
        return (page)
    }
}

export default Content;