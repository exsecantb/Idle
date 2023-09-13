import React, { Component } from 'react';
import AirDatepicker from 'air-datepicker';
import '../css/air-datepicker.css';

class InputDate extends Component {
    constructor(props) {
        super(props);
        this.element = null;
    }

    componentDidMount() {
        let day1 = new Date();
        let day2 =  new Date();
        let tempday = new Date();
        day2.setDate(day1.getDate() + 2);
        const datepicker = new AirDatepicker('#airdatepicker', {
            autoClose: true,
            range: true,
            multipleDatesSeparator: " - ",
            selectedDates: [day1, day2],
            minDate: new Date(),
            maxDate: tempday.setDate(tempday.getDate() + 729),
            onHide: function(){
                if (datepicker.selectedDates.length < 2) {
                    datepicker.clear();
                    datepicker.selectDate([day1, day2]);
                }
            }
        });
        this.element = datepicker;
    }

    componentWillUnmount() {
        this.element.destroy();
    }

    render() {
        return (<input id="airdatepicker" readOnly="readonly"/>);
    }
}

export default InputDate;