import React, { Component } from 'react';
import './GameEngine.scss';

class GameEngine {
  static forwardProb = 0.7;
  static passingProb = 0.25;
  static passingSuccess = 0.8;
  static passingRange = 5;
  static shootingProb = 0.01;
  static shootingSuccess = 0.5;
  static minShootingRange = 0.1;
  static maxShootingRange = 0.5;
  static maxPossession = 60;
  static fieldPos = ['df', 'mf', 'fw'];
  static levelDifference = 20;

  constructor(home, away, extraTime) {
    this.team = {
      'home': home,
      'away': away
    }
    this.extraTime = extraTime;
    this.stats = {
      goal: [],
      playerPosition: [],
      score: [],
      possessionCount: {
        'home': 0,
        'away': 0
      },
      passAttempt: {
        'home': 0,
        'away': 0
      },
      passSuccess: {
        'home': 0,
        'away': 0
      },
      shootAttempt: {
        'home': 0,
        'away': 0
      },
      shootSuccess: {
        'home': 0,
        'away': 0
      }
    };
  }

  static getPlayers(squad, pos, nums) {
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
      pool.splice(index, 1);
      nums -= 1;
    }
    return res;
  }

  static getStarter(squad, formation) {
    const res = {};
    res['gk'] = GameEngine.getPlayers(squad, 'GK', 1);
    res['df'] = GameEngine.getPlayers(squad, 'DF', formation[0]);
    res['mf'] = GameEngine.getPlayers(squad, 'MF', formation[1]);
    res['fw'] = GameEngine.getPlayers(squad, 'FW', formation[2]);
    return res;
  }

  static calcStyle(position) {
    return {
      'position': 'absolute',
      'left': `${position.x * 100}%`,
      'top': `${position.y * 100}%`
    };
  }

  static adjustPosition(position, direction) {
    const res = {...position};
    if (direction === 'left') {
      res.pos.x = (res.pos.x - 0.05) / 2 + 0.05;
    } else {
      res.pos.x = 1 - (res.pos.x - 0.05) / 2 - 0.05;
    }
    res.style.left = `${res.pos.x * 100}%`;
    return res;
  }

  static calcInitPosition(formation, pos, index) {
    const res = { style: {}, pos: {} }
    if (pos === -1) {
      res.pos = {
        x: 0.05,
        y: 0.5
      };
    } else if (formation[pos] === 6) {
      // 3-6-1 formation has differnt positions for MF
      if (index < 2) {
        res.pos = {
          x: 0.45,
          y: (index + 1) / 3.0
        };
      } else if (index < 4) {
        res.pos = {
          x: 0.55,
          y: (index === 2 ? 0.15 : 0.85)
        };
      } else {
        res.pos = {
          x: 0.65,
          y: (index - 3) / 3.0
        };
      }
    } else {
      res.pos = {
        x: 0.25 * (pos + 1) + 0.05,
        y: 1.0 / (formation[pos]) * index + 0.1 * (5 / formation[pos])
      };
    }
    res.style = GameEngine.calcStyle(res.pos);
    return res;
  }

  static resetPosition(
    homeStarter,
    homeFormation,
    homeDirection,
    homeTarget,
    awayStarter,
    awayFormation,
    awayDirection,
    awayTarget) {
    return {
      'home': {
        'gk': homeStarter['gk'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(homeFormation, -1, index), homeDirection
          );
        }),
        'df': homeStarter['df'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(homeFormation, 0, index), homeDirection
          );
        }),
        'mf': homeStarter['mf'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(homeFormation, 1, index), homeDirection
          );
        }),
        'fw': homeStarter['fw'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(homeFormation, 2, index), homeDirection
          );
        }),
        'target': homeTarget
      },
      'away': {
        'gk': awayStarter['gk'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(awayFormation, -1, index), awayDirection
          );
        }),
        'df': awayStarter['df'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(awayFormation, 0, index), awayDirection
          );
        }),
        'mf': awayStarter['mf'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(awayFormation, 1, index), awayDirection
          );
        }),
        'fw': awayStarter['fw'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(awayFormation, 2, index), awayDirection
          );
        }),
        'target': awayTarget
      }
    };
  }

  static switchPossession(who) {
    return who === 'home' ? 'away' : 'home'; 
  }

  static calcDistance(posX, posY) {
    return Math.sqrt((posX.x - posY.x) * (posX.x - posY.x) + (posX.y - posY.y) * (posX.y - posY.y));
  }

  static calcShootingSuccessRate(distance, rankingDifference) {
    const adjustedDistance = Math.max(GameEngine.minShootingRange, distance);
    const prob = GameEngine.minShootingRange / adjustedDistance;
    if (rankingDifference > 0) {
      return prob * prob * (rankingDifference + 1); 
    } else {
      return prob * prob / (1 - rankingDifference);
    }
  }

  static calcPassingSuccessRate(distance, rankingDifference) {
    const adjustedDistance = Math.max(GameEngine.minShootingRange, distance);
    const prob = GameEngine.minShootingRange / adjustedDistance;
    if (rankingDifference > 0) {
      return prob * (rankingDifference + 1); 
    } else {
      return prob / (1 - rankingDifference);
    }
  }

  runHalf(
    duration,
    firstPossession,
    homeStarter,
    homeFormation,
    homeDirection,
    homeTarget,
    awayStarter,
    awayFormation,
    awayDirection,
    awayTarget,
    initScore,
    timePassed) {
    let score = {...initScore};
    let possession = firstPossession;
    let player = { 'pos': 'fw', 'index': 0 };
    const initPosition = GameEngine.resetPosition(
      homeStarter,
      homeFormation,
      homeDirection,
      homeTarget,
      awayStarter,
      awayFormation,
      awayDirection,
      awayTarget
    );
    let currentPosition = {...initPosition};
    let consecutivePossession = 0;
    for (let step = 0; step < duration; ++step) {
      // TODO: take ranking into consideration
      const opponent = GameEngine.switchPossession(possession);
      const rankingDifference = (this.team[opponent].ranking - this.team[possession].ranking) / GameEngine.levelDifference;
      this.stats.playerPosition.push(currentPosition.style);
      this.stats.possessionCount[possession] += 1;
      // adjust consecutivePossession
      if (consecutivePossession === 0) {
        if (player.pos === 'gk') {
          consecutivePossession = GameEngine.maxPossession - 1;
        } else if (player.pos === 'df') {
          consecutivePossession = GameEngine.maxPossession / 3;
        } else if (player.pos === 'fw') {
          consecutivePossession = GameEngine.maxPossession / 2;
        }
      }
      // passing/shooting or keep possession
      if (Math.random() <= GameEngine.passingProb) {
        // passing or shooting
        const myPos = currentPosition[possession][player.pos][player.index].pos;
        const targetDistance = GameEngine.calcDistance(
          currentPosition[possession].target,
          myPos
        );
        if (targetDistance <= GameEngine.maxShootingRange &&
          Math.random() <= GameEngine.shootingProb) {
          this.stats.shootAttempt[possession] += 1;
          // shooting success or not
          if (Math.random() <= GameEngine.shootingSuccess &&
            Math.random() <= GameEngine.calcShootingSuccessRate(
              targetDistance, rankingDifference)) {
            this.stats.shootSuccess[possession] += 1;
            const playerName = possession === 'home' ?
              homeStarter[player.pos][player.index] :
              awayStarter[player.pos][player.index];
            this.stats.goal.push({
              teamName: this.team[possession].teamName,
              playerName,
              minitue: Number.parseInt((timePassed + step + 59) / 60)
            });
            // change score and reset possession & positions
            score[possession] += 1;
            possession = opponent;
            player = { 'pos': 'fw', 'index': 0 };
            currentPosition = {...initPosition};
            consecutivePossession = 0;
            continue;
          } else {
            possession = opponent;
            player = { 'pos': 'gk', 'index': 0 };
            consecutivePossession = 0;
          }
        } else {
          this.stats.passAttempt[possession] += 1;
          if (Math.random() <= GameEngine.passingSuccess &&
            Math.random() <= GameEngine.calcPassingSuccessRate(
              targetDistance, rankingDifference)) {
            this.stats.passSuccess[possession] += 1;
            const distanceArray = [];
            GameEngine.fieldPos.forEach(pos => {
              for (const index in currentPosition[possession][pos]) {
                if (pos !== player.pos || index !== player.index) {
                  distanceArray.push({
                    distance: GameEngine.calcDistance(
                      currentPosition[possession][pos][index].pos,
                      myPos
                    ),
                    pos,
                    index
                  });
                }
              }
            });
            distanceArray.sort((a, b) => {
              if (a.distance < b.distance) {
                return -1;
              }
              return a.distance > b.distance ? 1 : 0;
            });
            const who = Number.parseInt(Math.random() * GameEngine.passingRange);
            player = {
              'pos': distanceArray[who].pos,
              'index': distanceArray[who].index
            };
          } else {
            let minDistance = 1000000000;
            let nextPlayer = {};
            GameEngine.fieldPos.forEach(pos => {
              for (const index in currentPosition[opponent][pos]) {
                const distance = GameEngine.calcDistance(
                  currentPosition[opponent][pos][index].pos,
                  myPos
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  nextPlayer = { pos, index };
                }
              }
            });
            possession = opponent;
            player = nextPlayer;
          }
        }
        consecutivePossession = 0;
      } else {
        consecutivePossession += 1;
      }
      // movement
      const nextPosition = {...currentPosition};
      let attackDirection = homeDirection === 'left' ? 1 : -1;
      let defenseDirection = -attackDirection;
      if (possession !== 'home') {
        attackDirection = awayDirection === 'left' ? 1 : -1;
        defenseDirection = -attackDirection;
      }
      for (const side in currentPosition) {
        GameEngine.fieldPos.forEach(pos => {
          for (const index in currentPosition[side][pos]) {
            const { x, y } = currentPosition[side][pos][index].pos;
            if (side === possession) {
              if (Math.random() <= GameEngine.forwardProb) {
                nextPosition[side][pos][index].pos.x += 0.01 * attackDirection;
              } else {
                nextPosition[side][pos][index].pos.x -= 0.01 * attackDirection;
              }
            } else {
              if (Math.random() <= GameEngine.forwardProb) {
                nextPosition[side][pos][index].pos.x += 0.01 * defenseDirection;
              } else {
                nextPosition[side][pos][index].pos.x -= 0.01 * defenseDirection;
              }
            }
            const yProb = Math.random();
            if (yProb < 1.0 / 3) {
              nextPosition[side][pos][index].pos.y += 0.01;
            } else if (yProb > 2.0 / 3) {
              nextPosition[side][pos][index].pos.y -= 0.01;
            }
            // adjust position to prevent moveing outside of field
            if (nextPosition[side][pos][index].pos.x < 0.05 ||
              nextPosition[side][pos][index].pos.x > 0.95) {
              nextPosition[side][pos][index].pos.x = x;    
            }
            if (nextPosition[side][pos][index].pos.y < 0.05 ||
              nextPosition[side][pos][index].pos.y > 0.95) {
              nextPosition[side][pos][index].pos.y = y;    
            }
            nextPosition[side][pos][index].style = GameEngine.calcStyle(
              nextPosition[side][pos][index].pos
            );
          }
        });
      }
      currentPosition = nextPosition;
    }
    return score;
  }

  run(duration, initScore, timePassed) {
    // Initialization of lineup should be moved outside of the function due to incorrect logic
    const { squad: homeSquad, formation: homeFormation } = this.team['home'];
    const { squad: awaySquad, formation: awayFormation } = this.team['away'];
    const homeStarter = GameEngine.getStarter(homeSquad, homeFormation);
    const awayStarter = GameEngine.getStarter(awaySquad, awayFormation);
    // first half
    const firstHalfScore = this.runHalf(
      duration * 30,
      'home',
      homeStarter,
      homeFormation,
      'left',
      { x: 0.99, y: 0.5 },
      awayStarter,
      awayFormation,
      'right',
      { x: 0.01, y: 0.5 },
      initScore,
      timePassed
    );
    // second half
    const finalScore = this.runHalf(
      duration * 30,
      'away',
      homeStarter,
      homeFormation,
      'right',
      { x: 0.01, y: 0.5 },
      awayStarter,
      awayFormation,
      'left',
      { x: 0.99, y: 0.5 },
      firstHalfScore,
      timePassed + duration * 30
    );
    return finalScore;
  }

  penaltyShootout() {
    // TODO: implement penalty shootout
    let score = {
      'home': 0,
      'away': 0
    }
    return score;
  }

  startGame() {
    const regularScore = this.run(90, { 'home': 0, 'away': 0 }, 0);
    if (this.extraTime && regularScore.home === regularScore.away) {
      const extraScore = this.run(30, regularScore, 90 * 60);
      this.stats.score.push(extraScore);
      if (extraScore.home === extraScore.away) {
        const finalScore = this.penaltyShootout();
        this.stats.score.push(finalScore);
      }
    } else {
      this.stats.score.push(regularScore);
    }
  }
}

class GameVisualizer extends Component {
  state = {
    timer: 0,
    score: {
      'home': 0,
      'away': 0
    }
  }

  componentDidMount() {
    const { home, away, extraTime } = this.props;
    const engine = new GameEngine(home, away, extraTime);
    engine.startGame();
    this.setState({
      timer: (90 + (extraTime ? 30 : 0)) * 60,
      score: engine.stats.score[0]
    });
    console.log(engine.stats.goal);
    console.log(engine.stats.possessionCount);
    console.log(engine.stats.passAttempt);
    console.log(engine.stats.passSuccess);
    console.log(engine.stats.shootAttempt);
    console.log(engine.stats.shootSuccess);
  }

  handleChangeTimer = (newTimer) => {
    this.setState({
      timer: newTimer
    });
  }

  handleChangeScore = (newScore) => {
    this.setState({
      score: newScore
    });
  }

  formatNumber(num) {
    if (num < 10) {
      return '0' + num;
    }
    return num;
  }

  showTime(timer) {
    const minitues = Number.parseInt(timer / 60);
    const seconds = timer % 60;
    return `${this.formatNumber(minitues)} : ${this.formatNumber(seconds)}`;
  }

  render() {
    const { home, away, handleEndGame } = this.props;
    const { timer, score } = this.state;
    return (
      <div className="game-visualizer">
        <div className="game-visualizer__timer">
          <h1>{this.showTime(timer)}</h1>
        </div>
        <div className="scoreboard">
          <div className="scoreboard__team">
            <h1>{home.teamName}</h1>
          </div>
          <div className="scoreboard__score">
            <h1>{score.home} : {score.away}</h1>
          </div>
          <div className="scoreboard__team">
            <h1>{away.teamName}</h1>
          </div>
        </div>
        <div
          onClick={handleEndGame}
          className="button game-visualizer__button"
        >
          <p className="button__text">
            play another game
          </p>
        </div>
      </div>
    );
  }
}

export { GameEngine, GameVisualizer };
