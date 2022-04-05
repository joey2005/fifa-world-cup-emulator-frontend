import axios from 'axios';
import React, { Component } from 'react';
import './Squad.scss';

class Squad extends Component {
  state = {
    squad: {}
  }

  getTeamName() {
    const { teamName } = this.props;
    return teamName.replace(' ', '%20');
  }

  getPlayers(squad, pos, nums) {
    const pool = squad.filter(player => {
      return player.Pos === pos;
    });
    const res = [];
    while (nums > 0) {
      let index = -1;
      for (let i = 0; i < pool.length; ++i) {
        if (pool[i].Captain !== '0') {
          index = i;
          break;
        }
      }
      if (index === -1) {
        index = Number.parseInt(Math.random() * pool.length);
      }
      res.push(pool[index].Player);
      nums -= 1;
    }
    return res;
  }

  getStarter(squad, formation) {
    const res = {};
    res['gk'] = this.getPlayers(squad, 'GK', 1);
    res['df'] = this.getPlayers(squad, 'DF', formation[0]);
    res['mf'] = this.getPlayers(squad, 'MF', formation[1]);
    res['fw'] = this.getPlayers(squad, 'FW', formation[2]);
    return res;
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
          starter: this.getStarter(res.data, formationArray)
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
        starter: this.getStarter(squad, formationArray)
      });
    }
  }

  calcPosition(formation, pos, index) {
    console.log(formation, pos, index);
    if (pos == -1) {
      return {
        'position': 'absolute',
        'left': '5%',
        'top': '50%'
      };
    }
    if (formation[pos] === 6) {
      if (index < 2) {
        return {
          'position': 'absolute',
          'left': '45%',
          'top': `${33 * (index + 1)}%`
        };
      }
      if (index < 4) {
        return {
          'position': 'absolute',
          'left': '55%',
          'top': (index == 2 ? '15%' : '85%')
        };
      }
      return {
        'position': 'absolute',
        'left': '65%',
        'top': `${33 * (index - 3)}%`
      };
    } else {
      return {
        'position': 'absolute',
        'left': `${25 * (pos + 1) + 5}%`,
        'top': `${100 / (formation[pos]) * index + 10 * (5 / formation[pos])}%`
      }
    }
  }

  drawFormation() {
    const { starter, formation } = this.state;
    return (
      starter ?
      <div className="starter">
        <p style={this.calcPosition(formation, -1, 0)}>{starter['gk'][0]}</p>
        {
          starter['df'].map((player, index) => {
            return (
              <p
                key={index}
                style={this.calcPosition(formation, 0, index)}
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
                style={this.calcPosition(formation, 1, index)}
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
                style={this.calcPosition(formation, 2, index)}
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
      starter: this.getStarter(squad, formation)
    });
  }

  render() {
    return (
      <div className="squad">
        <div className="squad__presentation">
          {this.drawFormation()}
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
