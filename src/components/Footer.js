import React from 'react';
import logo from '../icon/footer.svg'

const Footer = () => {
    return (
    <div className="footer">
        <img className="footer_logo" src={logo} alt="Idle"/>
        <div className="contacts">
            <div className="mail">ceo@idlebot.ru</div>
            <div className="footer_separator"></div>
            <a className="channel" href="https://t.me/idlespot" rel="noreferrer" target="_blank">Телеграм-канал</a>
        </div>
        <a className="policy" href="https://idlebot.ru/agreement" rel="noreferrer" target="_blank">Политика конфиденциальности</a>
    </div>
    )
}

export default Footer;