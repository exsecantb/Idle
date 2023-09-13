import React from 'react';
import idle from '../icon/idle_new.svg';
import TelegramPanel from './TelegramPanel';
import p1 from '../icon/sutochno.svg'
import p2 from '../icon/ostrovok.svg'
import p3 from '../icon/tripster.svg'
import p4 from '../icon/aviasales.svg'


const Header = ({ onAuthorize }) => {
    const handleAuthorization = (id) => {
        onAuthorize(id);
    };

    return (
    <div className="header">
        <div className="logo">
            <img src={idle} alt="Idle" />
            <div className="partners">
                <a href="https://sutochno.tp.st/hSIWNLaA?erid=2VtzqxjR4ZW" rel="noreferrer" target="_blank"><img src={p1} alt="Sutochno" /></a>
                <a href="https://ostrovok.tp.st/vuv4DngK?erid=2VtzqvcPjbq" rel="noreferrer" target="_blank"><img src={p2} alt="Ostrovok" /></a>
                <a href="https://tripster.tp.st/sZr1JN8L?erid=2VtzqwBWn2L" rel="noreferrer" target="_blank"><img src={p3} alt="Tripster" /></a>
                <a href="https://aviasales.tp.st/vtKGXRcZ?erid=2Vtzqx6ZkHp" rel="noreferrer" target="_blank"><img src={p4} alt="Aviasales" /></a>
            </div>
        </div>
        <TelegramPanel onUserAuthorize={handleAuthorization} />
    </div>
    )
}

export default Header;