import React from 'react';
import Header from './components/Header';
import Menu from './components/Menu';
import Content from './components/Content';
import Footer from './components/Footer';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedChapter: "1",
            userId: null
        };
    }

    handleAuthorization = (id) => {
        this.setState({ userId: id });
    }

    handleChapterChange = (newChapter) => {
        this.setState({ selectedChapter: newChapter });
    }
    
    render() {
        return (<div>
            <div className="background">
                <Header onAuthorize={this.handleAuthorization} />
                <div className="main_title">Ваш помощник для быстрого поиска жилья, туров и авиабилетов</div>
                <div className="separator"></div>
                <div className="second_title">
                Мониторим популярные сервисы для путешествий и отбираем лучшие варианты для вас. Просто укажите свои предпочтения и мы сразу приступим к поиску!
                </div>
            </div>
            <div className="panel">
                <Menu onChapterChange={this.handleChapterChange} />
                <Content authorizeValue={this.state.userId} selectedChapter={this.state.selectedChapter} />
                <Footer />
            </div>
        </div>)
    }
}

export default App;
