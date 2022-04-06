import axios from 'axios';
import React, { Component } from 'react';
import { GameEngine } from '../../components/GameEngine/GameEngine';
import './Squad.scss';

class Squad extends Component {
  state = {
    squad: {}
  }

  getTeamName() {
    const { teamName } = this.props;
    return teamName.replace(' ', '%20');
  }

  drawPlayer() {
    const { starter, formation } = this.state;
    return (
      starter ?
      <div className="starter">
        <p style={GameEngine.calcInitPosition(formation, -1, 0).style}>
          {starter['gk'][0]}
        </p>
        {
          starter['df'].map((player, index) => {
            return (
              <p
                key={index}
                style={GameEngine.calcInitPosition(formation, 0, index).style}
              >
                {player}
              </p>
            );
          })
        }
        {
          starter['mf'].map((player, index) => {
            return (
              <p
                key={index}
                style={GameEngine.calcInitPosition(formation, 1, index).style}
              >
                {player}
              </p>
            );
          })
        }
        {
          starter['fw'].map((player, index) => {
            return (
              <p
                key={index}
                style={GameEngine.calcInitPosition(formation, 2, index).style}
              >
                {player}
              </p>
            );
          })
        }
      </div> :
      <></>
    );
  }

  handleChangeSquad = (event) => {
    event.preventDefault();
    const { squad, formation } = this.state;
    this.setState({
      starter: GameEngine.getStarter(squad, formation)
    });
  }

  componentDidMount() {
    const { formation } = this.props;
    const formationArray = formation.split('-').map(num => {
      return Number.parseInt(num);
    });
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/players?teamName=${this.getTeamName()}`)
      .then(res => {
        this.setState({
          squad: res.data,
          formation: formationArray,
          starter: GameEngine.getStarter(res.data, formationArray)
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentDidUpdate(prevProps) {
    const { formation } = this.props;
    const { squad } = this.state;
    if (formation !== prevProps.formation) {
      const formationArray = formation.split('-').map(num => {
        return Number.parseInt(num);
      });
      this.setState({
        formation: formationArray,
        starter: GameEngine.getStarter(squad, formationArray)
      });
    }
  }

  render() {
    return (
      <div className="squad">
        <div className="squad__presentation">
          {this.drawPlayer()}
        </div>
        <button
          onClick={this.handleChangeSquad}
          className="button squad__button"
        >
          <p>Change Squad</p>
        </button>
      </div>
    );
  }
}

export default Squad;
