import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import backArrow from '../../assets/icons/back_arrow_icon.svg';
import './SingleMatch.scss';

class SingleMatch extends Component {
  state = {
    teamsData: []
  }

  getNextTeam = (index, otherIndex) => {
    const { teamsData } = this.state;
    while (true) {
      index = (index + 1) % teamsData.length;
      if (index != otherIndex) {
        break;
      }
    }
    return index;
  }

  getPrevTeam = (index, otherIndex) => {
    const { teamsData } = this.state;
    while (true) {
      index = (index + teamsData.length - 1) % teamsData.length;
      if (index != otherIndex) {
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
      })
      .catch(err => {
        console.log(err);
      })
  }

  render() {
    const { homeTeam, awayTeam, teamsData } = this.state;
    return (
      awayTeam ?
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
              <h2 className="select-team__name">
                {teamsData[homeTeam].teamName}
              </h2>
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
              <h2 className="select-team__name">
                {teamsData[awayTeam].teamName}
              </h2>
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
        <Link to="#" className="link">
          <div className="button select-wrapper__button">
            <p className="button__text">
              start game
            </p>
          </div>
        </Link>
      </div> :
      <></>
    );
  }
}

export default SingleMatch;
