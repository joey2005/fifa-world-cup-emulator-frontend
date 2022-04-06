import React, { Component } from 'react';
import axios from 'axios';
import { GameVisualizer } from '../../components/GameEngine/GameEngine';
import backArrow from '../../assets/icons/back_arrow_icon.svg';
import './SingleMatch.scss';

class SingleMatch extends Component {
  state = {
    teamsData: [],
    playersData: [],
    startGame: false
  }

  getNextTeam = (index, otherIndex) => {
    const { teamsData } = this.state;
    while (true) {
      index = (index + 1) % teamsData.length;
      if (index !== otherIndex) {
        break;
      }
    }
    return index;
  }

  getPrevTeam = (index, otherIndex) => {
    const { teamsData } = this.state;
    while (true) {
      index = (index + teamsData.length - 1) % teamsData.length;
      if (index !== otherIndex) {
        break;
      }
    }
    return index;
  }

  componentDidMount() {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/teams`)
      .then(res => {
        this.setState({
          teamsData: res.data,
          homeTeam: 0,
          awayTeam: 1
        });
        return axios.get(`${process.env.REACT_APP_BACKEND_URL}/players`);
      })
      .then(res => {
        this.setState({
          playersData: res.data
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleStartGame = (event) => {
    event.preventDefault();
    this.setState({
      startGame: true
    });
  }

  handleEndGame = (event) => {
    event.preventDefault();
    this.setState({
      startGame: false
    });
  }

  render() {
    const {
      homeTeam,
      awayTeam,
      teamsData,
      playersData,
      startGame
    } = this.state;
    return (
      startGame ?
      <GameVisualizer
        home={{
          'squad': playersData.filter(player => {
            return player.Country === teamsData[homeTeam].teamName;
          }),
          'formation': teamsData[homeTeam].formation.split('-').map(num => {
            return Number.parseInt(num);
          }),
          'teamName': teamsData[homeTeam].teamName,
          'ranking': teamsData[homeTeam].teamID
        }}
        away={{
          'squad': playersData.filter(player => {
            return player.Country === teamsData[awayTeam].teamName;
          }),
          'formation': teamsData[awayTeam].formation.split('-').map(num => {
            return Number.parseInt(num);
          }),
          'teamName': teamsData[awayTeam].teamName,
          'ranking': teamsData[awayTeam].teamID
        }}
        extraTime={false}
        handleEndGame={this.handleEndGame}
      /> :
      (
        teamsData.length > 0 &&
        <div className="select-wrapper">
          <div className="select-team">
            <div className="select-team__home">
              <h1 className="select_team__title">
                Home Team
              </h1>
              <div className="select-team__image-box">
                <img
                  src={teamsData[homeTeam].country_flag}
                  alt="country-flag-home"
                  className="select-team__image"
                />
              </div>
              <div className="select-team__selector">
                <img 
                  onClick={(event) => {
                    event.preventDefault();
                    this.setState({
                      homeTeam: this.getPrevTeam(homeTeam, awayTeam)
                    });
                  }}
                  src={backArrow}
                  alt="go-back"
                  className="select-team__prev-icon"
                />
                <div className="select-team__name">
                  <h2>{teamsData[homeTeam].teamName}</h2>
                </div>
                <img 
                  onClick={(event) => {
                    event.preventDefault();
                    this.setState({
                      homeTeam: this.getNextTeam(homeTeam, awayTeam)
                    });
                  }}
                  src={backArrow}
                  alt="go-back"
                  className="select-team__next-icon"
                />
              </div>
            </div>
            <div className="select-team__vs">
              <h1>VS</h1>
            </div>
            <div className="select-team__away">
              <h1 className="select_team__title">
                Away Team
              </h1>
              <div className="select-team__image-box">
                <img
                  src={teamsData[awayTeam].country_flag}
                  alt="country-flag-home"
                  className="select-team__image"
                />
              </div>
              <div className="select-team__selector">
                <img 
                  onClick={(event) => {
                    event.preventDefault();
                    this.setState({
                      awayTeam: this.getPrevTeam(awayTeam, homeTeam)
                    });
                  }}
                  src={backArrow}
                  alt="go-back"
                  className="select-team__prev-icon"
                />
                <div className="select-team__name">
                  <h2>{teamsData[awayTeam].teamName}</h2>
                </div>
                <img 
                  onClick={(event) => {
                    event.preventDefault();
                    this.setState({
                      awayTeam: this.getNextTeam(awayTeam, homeTeam)
                    });
                  }}
                  src={backArrow}
                  alt="go-back"
                  className="select-team__next-icon"
                />
              </div>          
            </div>
          </div>
          <div
            onClick={this.handleStartGame}
            className="button select-wrapper__button"
          >
            <p className="button__text">
              start game
            </p>
          </div>
        </div>
      )
    );
  }
}

export default SingleMatch;
