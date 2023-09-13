import React from 'react';
import chapter1 from '../icon/chapter1.svg';
import chapter2 from '../icon/chapter2.svg';
import chapter3 from '../icon/chapter3.svg';
import chapter4 from '../icon/chapter4.svg';


class Chapter extends React.Component {
    titles = {
        "1": [chapter1, "Главная"],
        "2": [chapter2, "Жилье"],
        "3": [chapter3, "Туры"],
        "4": [chapter4, "Авиабилеты"]
    }
    render() {
        return (
        <div className="chapter" onClick={this.sendProperties}>
            <img alt="Раздел" src={this.titles[this.props.number][0]}/>
            <div className="chapter_name" id={"chapter_" + this.props.number}>{this.titles[this.props.number][1]}</div>
        </div>
        );
    }

    sendProperties = (event) => {
        const current_chapter = document.getElementById("chapter_" + this.props.number);
        const rect = current_chapter.getBoundingClientRect();
        const position = rect.left + (rect.width / 2);
        this.props.onChildData(Math.round(position), rect.width, this.props.number);
    }
    
}

export default Chapter;