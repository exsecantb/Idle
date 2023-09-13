import React from 'react';
import icon from '../icon/search.svg'
import icon_black from '../icon/search_black.svg'

const SearchButton = (props) => {
    const block1 = (<div className="button_container1">
        Поиск экскурсий
        <img src={icon_black}/>
    </div>
    );

    const block2 = (<div className="button_container2">
        Начать поиск
        <img src={icon_black}/>
    </div>
    );

    const block3 = (<a className="button_container3" href="https://t.me/idle1_bot">
        Поиск жилья
        <img src={icon_black}/>
    </a>
    );

    const block4 = (<a className="button_container3" href="https://t.me/IdleAvia_bot">
        Поиск авиабилетов
        <img src={icon_black}/>
    </a>
    );

    const onClickHandler = (props.className === "top_button" || props.className === "search_button") ? props.onButtonClick : null;

    return (
        <div className={props.className} onClick={onClickHandler}>
        {props.className === "top_button"
            ? block1
            : props.className === "search_button"
            ? block2
            : props.className === "tg_button1"
            ? block3
            : block4}
    </div>
    );
}

export default SearchButton;