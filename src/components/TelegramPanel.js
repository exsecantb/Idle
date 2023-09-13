import React from 'react';
import tg_icon from '../icon/telegram.svg';
import unknown_user from '../icon/nologin.jpg';
import nologin from '../icon/unknown.svg'
import TelegramLoginButton from 'react-telegram-login';
import axios from 'axios';

class TelegramPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAuthorized: false,
            userPicture: nologin
        };
    }

    handleAuthReady = (userId, username) => {
        const url = `https://idlebot.ru/backend/db.php?userID=${userId}&username=${username}`;

        axios.get(url)
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(error);
        });
    };
    
    handleTelegramResponse = (response) => {
        console.log("User is authorized.");
        localStorage.setItem('user_id', response.id);
        if (response.photo_url !== null) {
            localStorage.setItem('user_photo', response.photo_url);
            this.setState({
                isAuthorized: true,
                userPicture: response.photo_url
            });
        } else {
            localStorage.setItem('user_photo', 'unknown');
            this.setState({
                isAuthorized: true,
                userPicture: unknown_user
            });
        }
        this.props.onUserAuthorize(response.id);
        this.handleAuthReady(response.id, response.username);
    };

    componentDidMount() {
        const user_id = localStorage.getItem('user_id');
        const user_photo = localStorage.getItem('user_photo');
        if (user_photo !== null) {
            console.log("User is authorized.");
            if (user_photo === 'unknown') {
                this.setState({
                    isAuthorized: true,
                    userPicture: unknown_user
                });
            } else {
                this.setState({
                    isAuthorized: true,
                    userPicture: user_photo
                });
            }
            this.props.onUserAuthorize(user_id);
        }
    }

    render() {
        return (
        <div className="telegram_panel">
            <img id="tg_icon" src={tg_icon} alt="Telegram"/>
            <img id="user_avatar" src={this.state.userPicture} alt="User"/>
            <TelegramLoginButton cornerRadius={100} dataOnauth={this.handleTelegramResponse} botName="idle1_bot" usePic={true} className="telegram_button" />
        </div>
        )
    }
}

export default TelegramPanel;