import React from 'react';
import Chapter from './Chapter';

class Menu extends React.Component {
    handleSlider = (chapter_position, chapter_width, chapter_number) => {
        // Changing chapter
        this.props.onChapterChange(chapter_number);
        // Setting width
        const slider = document.getElementById("slider");
        slider.style.width = (parseInt(chapter_width) * 0.7).toString() + "px";
        // Setting left
        const rect = slider.getBoundingClientRect();
        let current_position = Math.round(rect.left + (rect.width / 2));
        let slider_styles = getComputedStyle(slider);
        let currentLeft = parseInt(slider_styles.getPropertyValue("left"));
        let newLeft = currentLeft + chapter_position - current_position;
        slider.style.left = newLeft.toString() + "px";
        window.scroll({
            top: 0,
            behavior: 'smooth'
        });
    }

    render() {
        return (
        <div className="menu">
            <div className="menu_blur"></div>
            <Chapter number="1" onChildData={this.handleSlider} />
            <Chapter number="2" onChildData={this.handleSlider} />
            <Chapter number="3" onChildData={this.handleSlider} />
            <Chapter number="4" onChildData={this.handleSlider} />
            <div id="slider"></div>
        </div>
        )
    }
}

export default Menu;