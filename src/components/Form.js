import React from 'react';
import InputCity from './InputCity';
import InputDate from './InputDate';
import InputGuests from './InputGuests';
import axios from 'axios';


function formatDate(dateString) {
    const dateParts = dateString.split(".");
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);
    const fullDate = new Date(year, month, day);

    return fullDate.toISOString().slice(0, 10);
}


class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cityId: null,
            guestValue: 1,
            isSent: false,
            isCrashed: false,
            isLoading: false,
            formId: Date.now()
        };
    }

    resetOutline = () => {
        document.getElementById("price_range").style.outline = "none";
        document.getElementById("preferences").style.outline = "none";
        document.getElementById("city").style.outline = "none";
    }

    preferences = [
        "Увидеть достопримечательности",
        "Пляж",
        "Местная культура",
        "Местная кухня",
        "Люкс",
        "История",
        "Вина",
        "Приключения и экстрим",
        "Спа",
        "Сафари",
        "Шоппинг",
        "Экологичное потребление",
        "Коренные народы и традиции",
        "Местное пиво",
        "Спортивные события",
        "Искусство и театр",
        "Музеи",
        "Ночные клубы",
        "Спорт и фитнесс"
    ];

    types = [
        "Романтическое",
        "В поисках чудес",
        "Глухомань",
        "Релакс",
        "Быстрый темп",
        "Премиальное",
        "Духовное",
        "Исследовательское",
        "Экстремальное"
    ];

    listPreferences = this.preferences.map((preference) =>
    <div key={this.preferences.indexOf(preference)}>
        <input onClick={this.resetOutline} className="preference" type="checkbox" name={preference} id={"pref_" + this.preferences.indexOf(preference)} />
        <label htmlFor={"pref_" + this.preferences.indexOf(preference)}>{preference}</label>
    </div>
    );

    listTypes = this.types.map((type) =>
    <div key={this.types.indexOf(type)}>
        <input className="type" type="checkbox" name={type} id={"type_" + this.types.indexOf(type)} />
        <label htmlFor={"type_" + this.types.indexOf(type)}>{type}</label>
    </div>
    );

    handleCitySubmit = (id) => {
        this.setState({
            cityId: id
        });
    };

    handleGuestsSubmit = (value) => {
        this.setState({
            guestValue: value
        });
    };

    checkFormAnswers = () => {
        // Checking city
        if (!this.state.cityId) {
            const el = document.getElementById("city");
            el.style.outline = "red 1px solid";
            const y = el.getBoundingClientRect().top + window.scrollY - 150;
            window.scroll({
                top: y,
                behavior: 'smooth'
            });
            return false;
        }
        // Checking price
        const current_min = parseInt(document.getElementById("price_min").value);
        const current_max = parseInt(document.getElementById("price_max").value);
        if (current_min >= current_max || current_min < 1 || isNaN(current_min) || isNaN(current_max)) {
            const el = document.getElementById("price_range");
            el.style.outline = "red 1px solid";
            const y = el.getBoundingClientRect().top + window.scrollY - 150;
            window.scroll({
                top: y,
                behavior: 'smooth'
            });
            return false;
        }
        // Checking preferences
        const all_pref = document.getElementsByClassName("preference");
        let checked_count = 0;
        Array.prototype.forEach.call(all_pref, function(pref) {
            if (pref.checked) {
                checked_count = checked_count + 1;
            }
        });
        if (checked_count === 0) {
            const el = document.getElementById("preferences");
            el.style.outline = "red 1px solid";
            const y = el.getBoundingClientRect().top + window.scrollY - 150;
            window.scroll({
                top: y,
                behavior: 'smooth'
            });
            return false;
        }
        return true;
    }

    sendResults = (formAnswers) => {
        const apiEndpoint = 'https://idlebot.fun';
        const retryCount = 3;

        this.setState({
            isLoading: true
        });
    
        const axiosInstance = axios.create({
            baseURL: apiEndpoint,
            timeout: 5000,
        });
    
        axiosInstance.interceptors.request.use((config) => {
            config.headers['Content-Type'] = 'application/json';
            config.headers['form-id'] = this.state.formId;
            config.headers['delivery-id'] = this.state.formId;
            return config;
        });
    
        axiosInstance.interceptors.response.use(undefined, (error) => {
            const { config, response } = error;

            if (response && response.status === 499) {
                config.__retryCount = config.__retryCount || 0;
    
                if (config.__retryCount >= retryCount) {
                    return Promise.reject(error);
                }
                config.__retryCount += 1;

                return new Promise((resolve) => {
                    setTimeout(() => resolve(axiosInstance(config)), 2000);
                });
            } else if (error.code === 'ECONNABORTED') {
                this.setState({
                    isLoading: false,
                    isSent: true
                });
            } else {
                return Promise.reject(error);
            }
        });
    
        axiosInstance.post('/tripster-form', formAnswers)
        .then((response) => {
            this.setState({
                isLoading: false,
                isSent: true
            });
        })
        .catch((error) => {
            if (error.code !== 'ECONNABORTED') {
                this.setState({
                    isLoading: false,
                    isCrashed: true
                });
            }
        });
    }

    collectFormAnswers = () => {
        if (this.checkFormAnswers()) {
            const dateString = document.getElementById("airdatepicker").value;
            const dateRange = dateString.split(" - ");
            const startDate = formatDate(dateRange[0]);
            const endDate = formatDate(dateRange[1]);

            const price_min = parseInt(document.getElementById("price_min").value);
            const price_max = parseInt(document.getElementById("price_max").value);

            const all_pref = document.getElementsByClassName("preference");
            let checked_pref = [];
            Array.prototype.forEach.call(all_pref, function(pref) {
                if (pref.checked) {
                    checked_pref.push(pref.name);
                }
            });

            const all_types = document.getElementsByClassName("type");
            let checked_types = [];
            Array.prototype.forEach.call(all_types, function(type) {
                if (type.checked) {
                    checked_types.push(type.name);
                }
            });

            const formAnswers = {
                "user_id": this.props.authorizeValue,
                "city_id": parseInt(this.state.cityId),
                "date_start": startDate,
                "date_end": endDate,
                "guests_count": this.state.guestValue,
                "price_min": price_min,
                "price_max": price_max,
                "list_preferences": checked_pref,
                "list_types": checked_types
            };
            
            // Sending results
            this.sendResults(formAnswers);
            // Yandex Metrika
            window.ym(94617149,'reachGoal','zayavka');

        }
    }

    formJsx = (
        <div className="form">
            <div className="question" id="city">
                <div className="text_field">
                    <div className="required">*</div>
                    <div className="label">Какой город планируете посетить?</div>
                </div>
                <InputCity onAnyChange={this.resetOutline} onCityChange={this.handleCitySubmit}/>
            </div>
            <div className="question">
                <div className="text_field">
                    <div className="required">*</div>
                    <div className="label">В какие даты планируете путешествие?</div>
                </div>
                <InputDate />
            </div>
            <div className="question">
                <div className="text_field">
                    <div className="required">*</div>
                    <div className="label">Сколько человек собирается в путешествие?</div>
                </div>
                <InputGuests onGuestsChange={this.handleGuestsSubmit}/>
            </div>
            <div className="question" id="price_range">
                <div className="text_field">
                    <div className="required">*</div>
                    <div className="label">Ваш комфортный бюджет на экскурсии?</div>
                </div>
                <div className="prices">
                    <input onChange={this.resetOutline} type="number" id="price_min" defaultValue="1500" pattern="\d*" />
                    —
                    <input onChange={this.resetOutline} type="number" id="price_max" defaultValue="7000" pattern="\d*" />
                </div>
            </div>
            <div className="question" id="preferences">
                <div className="text_field">
                    <div className="required">*</div>
                    <div className="label">Каковы ваши предпочтения в путешествии?</div>
                </div>
                <div className="preferences_list">
                    {this.listPreferences}
                </div>
            </div>
            <div className="question">
                <div className="text_field">
                    <div className="label">Какое настроение путешествия вы хотите?</div>
                </div>
                <div className="types">
                    {this.listTypes}
                </div>
                <div className="form_separator"></div>
                <div className="submit" onClick={this.collectFormAnswers}>Отправить в Telegram</div>
            </div>
        </div>
    );

    warnMessage = (
        <div className="warning">
            Пожалуйста, авторизуйтесь через Telegram, чтобы получить доступ к форме ↗️<br/>Не переживайте, <u>мы не получаем доступ к Вашей личной информации</u> - авторизация происходит на стороне Telegram.
        </div>
    );

    errorMessage = (
        <div className="warning">
            {"Кажется, произошла ошибка :("}<br />Не волнуйтесь, мы уже разбираемся с этим!
        </div>
    );

    loadMessage = (<div className="loader_container">
            <span className="loader"></span>
        </div>
    );

    sentMessage = (
        <div className="sent">
            {"Отлично! Мы уже завершили подбор экскурсий по вашим параметрам и отправили результаты вам в Telegram :)"}
        </div>
    );

    render() {
        let block = this.formJsx;
        if (!this.props.authorizeValue) {
            block = this.warnMessage;
        } else if (this.state.isLoading) {
            block = this.loadMessage;
        } else if (this.state.isCrashed) {
            block = this.errorMessage;
        }
        
        return (<div>
            {this.state.isSent ? this.sentMessage : block}
        </div>);
    }
}

export default Form;