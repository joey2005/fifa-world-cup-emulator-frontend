import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import TeamsPage from './pages/TeamsPage/TeamsPage';
import TeamInfo from './components/TeamInfo/TeamInfo';
import bg1 from './assets/images/stadium-1.jpg';
import bg2 from './assets/images/stadium-2.jpg';
import bg3 from './assets/images/stadium-3.jpg';
import bg4 from './assets/images/stadium-4.jpg';
import bg5 from './assets/images/stadium-5.jpg';
import bg6 from './assets/images/stadium-6.jpg';
import './App.scss';

class App extends Component {
  state = {
    currentIndex: 0,
    backgroundImages: [bg1, bg2, bg3, bg4, bg5, bg6]
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => {
        this.changeBackground();
      },
      4000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  nextIndex(currentIndex) {
    return (currentIndex + 1) % 6;
  }

  changeBackground() {
    this.setState(state => ({
      currentIndex: this.nextIndex(state.currentIndex)
    }));
  }

  render() {
    const { currentIndex, backgroundImages } = this.state;
    return (
      <Router>
        <div className="wrapper">
          <div className="wrapper__background">
            <img
              src={backgroundImages[currentIndex]}
              alt="background"
              className="wrapper__background-top"
            />
            <img
              src={backgroundImages[this.nextIndex(currentIndex)]}
              alt="background"
              className="wrapper__background-bottom"
            />
          </div>
          <div className="wrapper__main">
            <Switch>
              <Route path="/" exact component={MainPage} />
              <Route path="/teams" exact component={TeamsPage} />
              <Route path="/teams/:teamID" component={TeamInfo} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
