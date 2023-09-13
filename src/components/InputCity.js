import React, { Component } from 'react';
import axios from 'axios';

class InputCity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
            submitedName: 'Москва',
            submitedId: 146,
            data: [],
            isLoading: false,
            isEmpty: false,
            error: false
        };
        this.timer = null;
    }

    handleClick = (event) => {
        this.setState({
            inputValue: event.currentTarget.dataset.name,
            submitedName: event.currentTarget.dataset.name,
            submitedId: event.currentTarget.id,
            data: [],
            isLoading: false,
            isEmpty: false,
            error: false
        });
        this.props.onCityChange(event.currentTarget.id);
    }

    fetchData = () => {
        const { inputValue } = this.state;
        axios.get(`https://experience.tripster.ru/api/partners/${process.env.REACT_APP_TRIPSTER_ID}/search/site/?query=${inputValue}&types=city`, {
            headers: {
                'Authorization': `Token ${process.env.REACT_APP_TRIPSTER_TOKEN}`,
                'Content-type': 'application/json'
            }
        })
        .then(response => {
            if (response.data.length > 0) {
                let cities = [];
                for (let i = 0; i < Math.min(response.data.length, 5); i++) {
                    cities.push(response.data[i]);
                }
                const regex = "</?em>";
                const listSuggestions = cities.map((city) =>
                    <div onClick={this.handleClick} className="suggestion" key={city.id} id={city.id} data-name={city.title.replace(new RegExp(regex, "g"), "")}>
                        <div className="suggestion_title">{city.title.replace(new RegExp(regex, "g"), "")}</div>
                        <div className="suggestion_text">{city.country.name_ru.replace(new RegExp(regex, "g"), "")}</div>
                        <div className="exp_count">{city.experience_count}</div>
                    </div>
                );
                this.setState({
                    data: listSuggestions,
                    isLoading: false,
                    error: false,
                    isEmpty: false
                });
            } else {
                this.setState({
                    isEmpty: true,
                    isLoading: false
                });
            }
        })
        .catch(error => {
            this.setState({
                data: null,
                isLoading: false,
                error: true,
                isEmpty: false
            });
            console.error(error.message);
        });
    };

    handleChange = event => {
        this.props.onAnyChange();
        clearTimeout(this.timer);
        const value = event.target.value;
        
        if (value) {
            this.setState({
                inputValue: value,
                isLoading: true,
                data: [],
                error: false,
                isEmpty: false
            });
            this.timer = setTimeout(this.fetchData, 1000);
        } else {
            this.setState({
                inputValue: '',
                isLoading: false,
                data: [],
                error: false,
                isEmpty: false
            });
        }
    };

    handleClose = (event) => {
        const isClickedOnSuggestion = event.target.closest('.input_city');
        if (!isClickedOnSuggestion) {
            this.setState({
                data: [],
                error: false,
                isEmpty: false
            });
        }
    };

    componentDidMount() {
        document.addEventListener('click', this.handleClose);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClose);
    }

    errorMessage = (<div className="city_message">{"Кажется, произошла ошибка :("}</div>)
    loadingMessage = (<div className="city_message">{"Загружаем..."}</div>)
    emptyMessage = (<div className="city_message">{"Мы не знаем такое место :("}</div>)

    render() {
        const { inputValue, data, isLoading, isEmpty, error } = this.state;

        return (<div className="input_city">
            <input type="text" id="state" value={inputValue} onChange={this.handleChange} placeholder="Название города..."/>
            <div className="suggestions">
                {isLoading && this.loadingMessage}
                {data && data}
                {isEmpty && this.emptyMessage}
                {error && this.errorMessage}
            </div>
        </div>);
    }
}

export default InputCity;