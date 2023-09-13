import React from 'react';
import tgIcon from '../icon/telegram.svg';
import pattern from '../icon/pattern.png';


function getCurrentTime() {
    const currentTime = new Date();
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes;
}

const Widget = ({ name, pic, title, text, link }) => {
    return (
    <div className="widget">
        <div className="top_panel">
            <img alt="Бот" className="bot_pic" src={pic}></img>
            <div className="bot_text">
                <div className="bot_name">{name}</div>
                <div className="bot_status">Bot</div>
            </div>
        </div>
        <div className="message" style={{backgroundImage: "url(" + pattern + ")"}}>
            <div className="corner"></div>
            <div className="message_text">
                <div className="message_name">{name}</div>
                <div>{title}</div>
                <div>{text}</div>
                <div className="message_date">{getCurrentTime()}</div>
            </div>
        </div>
        <div className="bottom_panel">
            <a className="tg_button" href={link} target="_blank">
                <img alt="Телеграм" src={tgIcon}></img>
                <div className='button_text'>Перейти в Telegram</div>
            </a>
        </div>
    </div>
    )
}

export default Widget;