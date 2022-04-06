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
    this.schedule = [
      [['A', '1'], ['A', '2']],
      [['A', '3'], ['A', '4']],
      [['B', '1'], ['B', '2']],
      [['B', '3'], ['B', '4']],
      [['C', '1'], ['C', '2']],
      [['C', '3'], ['C', '4']],
      [['D', '1'], ['D', '2']],
      [['D', '3'], ['D', '4']],
      [['E', '1'], ['E', '2']],
      [['E', '3'], ['E', '4']],
      [['F', '1'], ['F', '2']],
      [['F', '3'], ['F', '4']],
      [['G', '1'], ['G', '2']],
      [['G', '3'], ['G', '4']],
      [['H', '1'], ['H', '2']],
      [['H', '3'], ['H', '4']],
      [['A', '1'], ['A', '3']],
      [['A', '2'], ['A', '4']],
      [['B', '1'], ['B', '3']],
      [['B', '2'], ['B', '4']],
      [['C', '1'], ['C', '3']],
      [['C', '2'], ['C', '4']],
      [['D', '1'], ['D', '3']],
      [['D', '2'], ['D', '4']],
      [['E', '1'], ['E', '3']],
      [['E', '2'], ['E', '4']],
      [['F', '1'], ['F', '3']],
      [['F', '2'], ['F', '4']],
      [['G', '1'], ['G', '3']],
      [['G', '2'], ['G', '4']],
      [['H', '1'], ['H', '3']],
      [['H', '2'], ['H', '4']],
      [['A', '1'], ['A', '4']],
      [['A', '3'], ['A', '2']],
      [['B', '1'], ['B', '4']],
      [['B', '3'], ['B', '2']],
      [['C', '1'], ['C', '4']],
      [['C', '3'], ['C', '2']],
      [['D', '1'], ['D', '4']],
      [['D', '3'], ['D', '2']],
      [['E', '1'], ['E', '4']],
      [['E', '3'], ['E', '2']],
      [['F', '1'], ['F', '4']],
      [['F', '3'], ['F', '2']],
      [['G', '1'], ['G', '4']],
      [['G', '3'], ['G', '2']],
      [['H', '1'], ['H', '4']],
      [['H', '3'], ['H', '2']],
    ];
    this.allStandings = {};
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
      this.allStandings[group] = standings;
    }
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

  calcStandings() {
    const res = {};
    for (const group in this.allStandings) {
      const finalStandings = [];
      for (const team in this.allStandings[group]) {
        finalStandings.push({
          teamName: team,
          ...this.allStandings[group][team]
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

  nextGame(matchID) {
    const group = this.schedule[matchID][0][0];
    const i = this.schedule[matchID][0][1];
    const j = this.schedule[matchID][1][1];
    const teamX = this.teams[group][i];
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
      this.allStandings[group][teamX.teamName].L += 1;
      this.allStandings[group][teamY.teamName].W += 1;
      this.allStandings[group][teamY.teamName].pts += 3;
    } else if (rs.home > rs.away) {
      this.allStandings[group][teamX.teamName].W += 1;
      this.allStandings[group][teamX.teamName].pts += 3;
      this.allStandings[group][teamY.teamName].L += 1;
    } else {
      this.allStandings[group][teamX.teamName].D += 1;
      this.allStandings[group][teamX.teamName].pts += 1;
      this.allStandings[group][teamY.teamName].D += 1;
      this.allStandings[group][teamY.teamName].pts += 1;
    }
    this.allStandings[group][teamX.teamName].GF += rs.home;
    this.allStandings[group][teamX.teamName].GA += rs.away;
    this.allStandings[group][teamX.teamName].GD += rs.home - rs.away;
    this.allStandings[group][teamY.teamName].GF += rs.away;
    this.allStandings[group][teamY.teamName].GA += rs.home;
    this.allStandings[group][teamY.teamName].GD += rs.away - rs.home;
    return {
      'home': teamX.teamName,
      'homeScore': rs.home,
      'away': teamY.teamName,
      'awayScore': rs.away
    };
  }
}

class TournamentMatch extends Component {
  state = {
    standings: {},
    nextGroupStageGame: 0,
    groupMatchResult: []
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
          teamsData,
          playersData,
          groupStage: new GroupStage(teamsData, playersData)
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleStartGroupStage = () => {
    this.timerID = setInterval(
      () => {
        this.runNextGroupStageGame();
      },
      1500
    );
  }

  runNextGroupStageGame() {
    const { groupStage, nextGroupStageGame, groupMatchResult } = this.state;
    const matchResult1 = groupStage.nextGame(nextGroupStageGame);
    const matchResult2 = groupStage.nextGame(nextGroupStageGame + 1);
    this.setState({
      standings: groupStage.calcStandings(),
      nextGroupStageGame: nextGroupStageGame + 2,
      groupMatchResult: groupMatchResult.concat([matchResult1, matchResult2])
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { groupStage, nextGroupStageGame } = this.state;
    if (nextGroupStageGame > prevState.nextGroupStageGame &&
      nextGroupStageGame === groupStage.schedule.length) {
      clearInterval(this.timerID);
      this.setState({
        startKnockout: true
      });
    }
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
    const {
      standings,
      groupStage,
      groupMatchResult,
      startKnockout
    } = this.state;
    const groupID = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return (
      <div className="tournament">
        {
          groupMatchResult.length > 0 &&
          <div className="tournament__group-match">
            <h2 className="tournament__group-match-title">Match Result</h2>
            {
              groupMatchResult.map((matchResult, index) => {
                return (
                  <div key={index} className="tournament__group-match-result">
                    <p className="tournament__group-match-team">
                      {matchResult.home}
                    </p>
                    <p className="tournament__group-match-score">
                      {matchResult.homeScore} : {matchResult.awayScore} 
                    </p>
                    <p className="tournament__group-match-team">
                      {matchResult.away}
                    </p>
                  </div>
                );
              })
            }
          </div>
        }
        <div className="tournament__group">
          {
            groupID.map((group, index) => {
              return (
                groupStage &&
                <div key={index} className="tournament__group-standings">
                  <h2 className="tournament__group-name">Group {group}</h2>
                  {
                    this.createStandings(
                      standings[group],
                      groupStage.teams[group]
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
