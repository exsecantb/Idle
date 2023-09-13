import React, { Component } from 'react';

class InputGuests extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 1
        };
    }

    generateGuestName = (number) => {
        let result = number + " Человек";
        if (number % 10 === 2 || number % 10 === 3 || number % 10 === 4) {
            result = number + " Человека";
        }
        if (number === 12 || number === 13 || number === 14) {
            result = number + " Человек";
        }
        return result;
    }

    handleRemove = () => {
        if (this.state.count > 1) {
            this.setState({
                count: this.state.count - 1
            });
            this.props.onGuestsChange(this.state.count - 1);
            document.getElementsByClassName("plus")[0].style.color = "grey";
        }
        if (this.state.count === 2) {
            document.getElementsByClassName("minus")[0].style.color = "#C3C3C3";
        }
    }

    handleAdd = () => {
        if (this.state.count < 50) {
            this.setState({
                count: this.state.count + 1
            });
            this.props.onGuestsChange(this.state.count + 1);
            document.getElementsByClassName("minus")[0].style.color = "grey";
        }
        if (this.state.count === 49) {
            document.getElementsByClassName("plus")[0].style.color = "#C3C3C3";
        }
    }

    render() {
        return (<div className="guest_block">
            <div className="minus" onClick={this.handleRemove}>–</div>
            <div className="guests">{this.generateGuestName(this.state.count)}</div>
            <div className="plus" onClick={this.handleAdd}>+</div>
        </div>);
    }
}

export default InputGuests;