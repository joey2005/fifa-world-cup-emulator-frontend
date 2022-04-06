import React, { Component } from 'react';
import axios from 'axios';
import { GameEngine } from '../../components/GameEngine/GameEngine';
import './TournamentMatch.scss';

class GroupStage {
  constructor(teamsData, playersData) {
    this.teams = {
      'A': {},
      'B': {},
      'C': {},
      'D': {},
      'E': {},
      'F': {},
      'G': {},
      'H': {}
    };
    this.formations = {
      'A': {},
      'B': {},
      'C': {},
      'D': {},
      'E': {},
      'F': {},
      'G': {},
      'H': {}
    }
    this.players = {
      'A': {},
      'B': {},
      'C': {},
      'D': {},
      'E': {},
      'F': {},
      'G': {},
      'H': {}
    }
    teamsData = GroupStage.shuffle(teamsData);
    teamsData.forEach(team => {
      if (!this.teams[team.group][team.position]) {
        this.teams[team.group][team.position] = {...team};
        this.formations[team.group][team.position] =
          team.formation.split('-').map(num => {
            return Number.parseInt(num);
          });
        this.players[team.group][team.position] = playersData.filter(player => {
          return player.Country === team.teamName;
        });
      }
    });
  }

  static shuffle(array) {
    for (let i = 1; i < array.length; ++i) {
      let j = Number.parseInt(Math.random() * i);
      const temp = {...array[i]};
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  startGame() {
    const res = {};
    for (const group in this.teams) {
      // init standings
      const standings = {}
      for (const i in this.teams[group]) {
        standings[this.teams[group][i].teamName] = {
          'pts': 0,
          'W': 0,
          'D': 0,
          'L': 0,
          'GF': 0,
          'GA': 0,
          'GD': 0
        };
      }
      for (const i in this.teams[group]) {
        const teamX = this.teams[group][i];
        for (const j in this.teams[group]) {
          if (i < j) {
            const teamY = this.teams[group][j];
            const engine = new GameEngine(
              {
                'squad': this.players[group][i],
                'formation': this.formations[group][i],
                'teamName': teamX.teamName,
                'ranking': teamX.teamID
              },
              {
                'squad': this.players[group][j],
                'formation': this.formations[group][j],
                'teamName': teamY.teamName,
                'ranking': teamY.teamID
              },
              false,
              true
            );
            const score = engine.startGame();
            const { regularScore : rs } = score;
            if (rs.home < rs.away) {
              standings[teamX.teamName].L += 1;
              standings[teamY.teamName].W += 1;
              standings[teamY.teamName].pts += 3;
            } else if (rs.home > rs.away) {
              standings[teamX.teamName].W += 1;
              standings[teamX.teamName].pts += 3;
              standings[teamY.teamName].L += 1;
            } else {
              standings[teamX.teamName].D += 1;
              standings[teamX.teamName].pts += 1;
              standings[teamY.teamName].D += 1;
              standings[teamY.teamName].pts += 1;
            }
            standings[teamX.teamName].GF += rs.home;
            standings[teamX.teamName].GA += rs.away;
            standings[teamX.teamName].GD += rs.home - rs.away;
            standings[teamY.teamName].GF += rs.away;
            standings[teamY.teamName].GA += rs.home;
            standings[teamY.teamName].GD += rs.away - rs.home;
            console.log(teamX.teamName, rs.home, ':', rs.away, teamY.teamName);
          }
        }
      }
      const finalStandings = [];
      for (const team in standings) {
        finalStandings.push({
          teamName: team,
          ...standings[team]
        });
      }
      finalStandings.sort((teamX, teamY) => {
        if (teamX.pts !== teamY.pts) {
          return teamX.pts > teamY.pts ? -1 : 1;
        }
        if (teamX.GD !== teamY.GD) {
          return teamX.GD > teamY.GD ? -1 : 1;
        }
        if (teamX.GF !== teamY.GF) {
          return teamX.GF > teamY.GF ? -1 : 1;
        }
        if (teamX.W !== teamY.W) {
          return teamX.W > teamY.W ? -1 : 1;
        }
        return teamX.teamName < teamY.teamName ? -1 : 1;
      });
      res[group] = finalStandings;
    }
    return res;
  }
}

class TournamentMatch extends Component {
  state = {
    standings: {}
  }

  componentDidMount() {
    let teamsData = [], playersData = [];
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/teams`)
      .then(res => {
        teamsData = res.data;
        return axios.get(`${process.env.REACT_APP_BACKEND_URL}/players`);
      })
      .then(res => {
        playersData = res.data;
        this.setState({
          GroupStage: new GroupStage(teamsData, playersData)
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleStartGroupStage = () => {
    const { GroupStage } = this.state;
    this.setState({
      standings: GroupStage.startGame(),
      startKnockout: true
    });
  }

  handleStartKnockout = () => {
  }

  createStandings(finalStandings, teamsData) {
    let standings = [];
    if (finalStandings) {
      standings = finalStandings;
    } else {
      for (const index in teamsData) {
        standings.push({
          'teamName': teamsData[index].teamName,
          'W': 0,
          'D': 0,
          'L': 0,
          'GF': 0,
          'GA': 0,
          'GD': 0,
          'pts': 0
        });
      }
    }
    const navBar = ['Team', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'];
    const itemKey = ['teamName', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'pts'];
    return (
      <>
        <div className="tournament__standing-nav">
          {
            navBar.map(item => {
              let className = "tournament__standing-nav-item tournament__standing-nav-item--bold";
              if (item === 'Team') {
                className += " tournament__standing-nav-item--first";
              }
              return (
                <p key={item} className={className}>{item}</p>
              );
            })
          }
        </div>
        {
          standings.map((team, index) => {
            let className = "tournament__team-standing";
            if (index < 2) {
              className += " tournament__team-standing--green";
            }
            return (
              <div key={index} className={className}>
                {
                  itemKey.map(item => {
                    let className = "tournament__team-stats";
                    if (item === 'teamName') {
                      className += " tournament__team-stats--first";
                      className += " tournament__team-stats--bold";
                    }
                    return (
                      <p key={item} className={className}>{team[item]}</p>
                    );
                  })
                }
              </div>
            );
          })
        }
      </>
    );
  }

  render() {
    const { standings, GroupStage, startKnockout } = this.state;
    const groupID = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return (
      <div className="tournament">
        <div className="tournament__group">
          {
            groupID.map((group, index) => {
              return (
                GroupStage &&
                <div key={index} className="tournament__group-standings">
                  <h2 className="tournament__group-name">Group {group}</h2>
                  {
                    this.createStandings(
                      standings[group],
                      GroupStage.teams[group]
                    )
                  }
                </div>
              );
            })
          }
        </div>
        {
          startKnockout ?
          <button
            onClick={(event) => {
              event.preventDefault();
              this.handleStartKnockout();
            }}
            className="button tournament__button"
          >
            <p className="button-text">
              Start Knockout Stage
            </p>
          </button> :
          <button
            onClick={(event) => {
              event.preventDefault();
              this.handleStartGroupStage();
            }}
            className="button tournament__button"
          >
            <p className="button-text">
              Start Group Stage
            </p>
          </button>
        }
      </div>
    );
  }
}

export default TournamentMatch;
