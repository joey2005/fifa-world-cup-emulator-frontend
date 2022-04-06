import React, { Component } from 'react';
import homePlayerIcon from '../../assets/icons/plain-blue-football-shirt.svg';
import awayPlayerIcon from '../../assets/icons/plain-white-football-shirt.svg';
import soccerIcon from '../../assets/icons/soccer_ball.svg';
import './GameEngine.scss';

class GameEngine {
  static forwardProb = 0.8;
  static passingProb = 0.25;
  static passingSuccess = 0.85;
  static passingRange = 5;
  static shootingProb = 0.01;
  static shootingSuccess = 0.5;
  static minShootingRange = 0.2;
  static maxShootingRange = 0.5;
  static penaltySuccess = 0.7;
  static maxPossession = 60;
  static fieldPos = ['df', 'mf', 'fw'];
  static fieldPosAll = ['gk', 'df', 'mf', 'fw'];
  static levelDifference = 20;
  static minFormDistance = 0.08;
  static INF = 1000000000;

  constructor(home, away, extraTime, doNotRecord) {
    this.team = {
      'home': home,
      'away': away
    }
    this.extraTime = extraTime;
    this.doNotRecord = doNotRecord;
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

  static getPlayers(squad, pos, nums, extraPool) {
    let pool = squad.filter(player => {
      return player.Pos === pos;
    });
    if (pool.length < nums) {
      pool = pool.concat(extraPool);
    }
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
    return {res, pool};
  }

  static getStarter(squad, formation) {
    const res = {};
    res['gk'] = GameEngine.getPlayers(squad, 'GK', 1, []).res;
    res['df'] = GameEngine.getPlayers(squad, 'DF', formation[0], []).res;
    const tempRes = GameEngine.getPlayers(squad, 'MF', formation[1], []);
    res['mf'] = tempRes.res;
    res['fw'] = GameEngine.getPlayers(squad, 'FW', formation[2], tempRes.pool).res;
    return res;
  }

  static calcStyle(position, direction) {
    return direction === 'left' ?
      {
        'position': 'absolute',
        'left': `${position.x * 100}%`,
        'top': `${position.y * 100}%`
      } :
      {
        'position': 'absolute',
        'left': `${(position.x - 0.02) * 100}%`,
        'top': `${position.y * 100}%`
      };
  }

  static calcStyleAll(position, direction) {
    const res = {};
    GameEngine.fieldPosAll.forEach(pos => {
      res[pos] = [];
      for (const index in position[pos]) {
        res[pos].push(GameEngine.calcStyle(position[pos][index], direction));
      }
    });
    return res;
  }

  static copyObj(obj) {
    if (this.doNotRecord) {
      return {...obj};
    }
    return JSON.parse(JSON.stringify(obj));
  }

  static adjustPosition(position, direction) {
    const res = {...position};
    if (direction === 'left') {
      res.x = (res.x - 0.05) / 2 + 0.05;
    } else {
      res.x = 1 - (res.x - 0.05) / 2 - 0.05;
    }
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
    res.style = GameEngine.calcStyle(res.pos, 'left');
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
            GameEngine.calcInitPosition(homeFormation, -1, index).pos,
            homeDirection
          );
        }),
        'df': homeStarter['df'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(homeFormation, 0, index).pos,
            homeDirection
          );
        }),
        'mf': homeStarter['mf'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(homeFormation, 1, index).pos,
            homeDirection
          );
        }),
        'fw': homeStarter['fw'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(homeFormation, 2, index).pos,
            homeDirection
          );
        }),
        'target': homeTarget
      },
      'away': {
        'gk': awayStarter['gk'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(awayFormation, -1, index).pos,
            awayDirection
          );
        }),
        'df': awayStarter['df'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(awayFormation, 0, index).pos,
            awayDirection
          );
        }),
        'mf': awayStarter['mf'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(awayFormation, 1, index).pos,
            awayDirection
          );
        }),
        'fw': awayStarter['fw'].map((player, index) => {
          return GameEngine.adjustPosition(
            GameEngine.calcInitPosition(awayFormation, 2, index).pos,
            awayDirection
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

  static calcMoveAreaLeft(position, opponentPosition) {
    const res = { 'df': {}, 'mf': {}, 'fw': {} };
    // DF
    res.df.xMin = 0.05 + GameEngine.minFormDistance;
    res.df.xMax = GameEngine.INF;
    position.mf.forEach(pos => {
      res.df.xMax = Math.min(res.df.xMax, pos.x - GameEngine.minFormDistance);
    });
    opponentPosition.fw.forEach(pos => {
      res.df.xMax = Math.min(res.df.xMax, pos.x);
    })
    // MF
    res.mf.xMin = -GameEngine.INF;
    position.df.forEach(pos => {
      res.mf.xMin = Math.max(res.mf.xMin, pos.x + GameEngine.minFormDistance);
    });
    res.mf.xMax = GameEngine.INF;
    position.fw.forEach(pos => {
      res.mf.xMax = Math.min(res.mf.xMax, pos.x - GameEngine.minFormDistance);
    });
    // FW
    res.fw.xMin = -GameEngine.INF;
    position.mf.forEach(pos => {
      res.fw.xMin = Math.max(res.fw.xMin, pos.x + GameEngine.minFormDistance);
    });
    res.fw.xMax = -GameEngine.INF;
    opponentPosition.df.forEach(pos => {
      res.fw.xMax = Math.max(res.fw.xMax, pos.x);
    });
    return res;
  }

  static calcMoveAreaRight(position, opponentPosition) {
    const res = { 'df': {}, 'mf': {}, 'fw': {} };
    // DF
    res.df.xMax = 0.95 - GameEngine.minFormDistance;
    res.df.xMin = -GameEngine.INF;
    position.mf.forEach(pos => {
      res.df.xMin = Math.max(res.df.xMin, pos.x + GameEngine.minFormDistance);
    });
    opponentPosition.fw.forEach(pos => {
      res.df.xMin = Math.max(res.df.xMin, pos.x);
    });
    // MF
    res.mf.xMax = GameEngine.INF;
    position.df.forEach(pos => {
      res.mf.xMax = Math.min(res.mf.xMax, pos.x - GameEngine.minFormDistance);
    });
    res.mf.xMin = -GameEngine.INF;
    position.fw.forEach(pos => {
      res.mf.xMin = Math.max(res.mf.xMin, pos.x + GameEngine.minFormDistance);
    });
    // FW
    res.fw.xMax = GameEngine.INF;
    position.mf.forEach(pos => {
      res.fw.xMax = Math.min(res.fw.xMax, pos.x - GameEngine.minFormDistance);
    });
    res.fw.xMin = GameEngine.INF;
    opponentPosition.df.forEach(pos => {
      res.fw.xMin = Math.min(res.fw.xMin, pos.x);
    });
    return res;
  }

  static calcMoveArea(position, direction) {
    const res = { 'home': {}, 'away': {} };
    // home
    if (direction === 'left') {
      res.home = this.calcMoveAreaLeft(position.home, position.away);
    } else {
      res.home = this.calcMoveAreaRight(position.home, position.away);
    }
    // away
    if (direction === 'left') {
      res.away = this.calcMoveAreaLeft(position.away, position.home);
    } else {
      res.away = this.calcMoveAreaRight(position.away, position.home);
    }
    return res;
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
    let currentPosition = GameEngine.copyObj(initPosition);
    let consecutivePossession = 0;
    for (let step = 0; step < duration; ++step) {
      if (!this.doNotRecord) {
        this.stats.score.push({...score});
        this.stats.playerPosition.push({
          homeStyle: GameEngine.calcStyleAll(currentPosition.home, homeDirection),
          awayStyle: GameEngine.calcStyleAll(currentPosition.away, awayDirection)
        });
        this.stats.possessionCount[possession] += 1;
      }
      const opponent = GameEngine.switchPossession(possession);
      const rankingDifference = (this.team[opponent].ranking - this.team[possession].ranking) / GameEngine.levelDifference;
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
        const myPos = currentPosition[possession][player.pos][player.index];
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
              targetDistance, rankingDifference
            )) {
            if (!this.doNotRecord) { 
              this.stats.shootSuccess[possession] += 1;
              const playerName = possession === 'home' ?
                homeStarter[player.pos][player.index] :
                awayStarter[player.pos][player.index];
              this.stats.goal.push({
                possession,
                playerName,
                time: Number.parseInt((timePassed + step + 59) / 60)
              });
            }
            // change score and reset possession & positions
            score[possession] += 1;
            possession = opponent;
            player = { 'pos': 'fw', 'index': 0 };
            currentPosition = GameEngine.copyObj(initPosition);
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
              targetDistance, rankingDifference
            )) {
            if (!this.doNotRecord) {
              this.stats.passSuccess[possession] += 1;
            }
            const distanceArray = [];
            GameEngine.fieldPos.forEach(pos => {
              for (const index in currentPosition[possession][pos]) {
                if (pos !== player.pos || index !== player.index) {
                  distanceArray.push({
                    distance: GameEngine.calcDistance(
                      currentPosition[possession][pos][index],
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
            let minDistance = GameEngine.INF;
            let nextPlayer = {};
            GameEngine.fieldPos.forEach(pos => {
              for (const index in currentPosition[opponent][pos]) {
                const distance = GameEngine.calcDistance(
                  currentPosition[opponent][pos][index],
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
      const moveArea = GameEngine.calcMoveArea(
        currentPosition, 
        possession === 'home' ? homeDirection : awayDirection
      );
      const nextPosition = GameEngine.copyObj(currentPosition);
      let attackDirection = homeDirection === 'left' ? 1 : -1;
      let defenseDirection = -attackDirection;
      if (possession !== 'home') {
        attackDirection = awayDirection === 'left' ? 1 : -1;
        defenseDirection = -attackDirection;
      }
      for (const side in currentPosition) {
        GameEngine.fieldPos.forEach(pos => {
          for (const index in currentPosition[side][pos]) {
            const { x, y } = currentPosition[side][pos][index]
            if (side === possession) {
              if (Math.random() <= GameEngine.forwardProb) {
                nextPosition[side][pos][index].x += 0.01 * attackDirection;
              } else {
                nextPosition[side][pos][index].x -= 0.01 * attackDirection;
              }
            } else {
              if (Math.random() <= GameEngine.forwardProb) {
                nextPosition[side][pos][index].x += 0.01 * defenseDirection;
              } else {
                nextPosition[side][pos][index].x -= 0.01 * defenseDirection;
              }
            }
            const yProb = Math.random();
            if (yProb < 1.0 / 3) {
              nextPosition[side][pos][index].y += 0.01;
            } else if (yProb > 2.0 / 3) {
              nextPosition[side][pos][index].y -= 0.01;
            }
            // adjust position to prevent moveing outside of field
            if (nextPosition[side][pos][index].x < moveArea[side][pos].xMin ||
              nextPosition[side][pos][index].x > moveArea[side][pos].xMax) {
              nextPosition[side][pos][index].x = x;    
            }
            if (nextPosition[side][pos][index].y < 0.05 ||
              nextPosition[side][pos][index].y > 0.95) {
              nextPosition[side][pos][index].y = y;    
            }
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
    let score = {
      'home': 0,
      'away': 0
    }
    for (let turn = 0; turn < 5; ++turn) {
      // home
      if (Math.random() <= GameEngine.penaltySuccess) {
        score.home += 1;
      }
      if (score.home - score.away > 5 - turn ||
        score.away - score.home > 4 - turn) {
        return score;
      }
      // away
      if (Math.random() <= GameEngine.penaltySuccess) {
        score.away += 1;
      }
      if (score.away - score.home > 4 - turn ||
        score.home - score.away > 4 - turn) {
        return score;
      }
    }
    while (score.home === score.away) {
      if (Math.random() <= GameEngine.penaltySuccess) {
        score.home += 1;
      }
      if (Math.random() <= GameEngine.penaltySuccess) {
        score.away += 1;
      }
    }
    return score;
  }

  startGame() {
    const res = {};
    res.regularScore = this.run(90, { 'home': 0, 'away': 0 }, 0);
    if (this.extraTime && res.regularScore.home === res.regularScore.away) {
      res.extraScore = this.run(30, res.regularScore, 90 * 60);
      if (res.extraScore.home === res.extraScore.away) {
        res.penaltyScore = this.penaltyShootout();
      }
    }
    return res;
  }
}

class GameVisualizer extends Component {
  state = {
    timer: 0,
    score: {
      'home': 0,
      'away': 0
    },
    goalPointer: 0,
    goalHome: [],
    goalAway: []
  }

  componentDidMount() {
    const { home, away, extraTime } = this.props;
    this.engine = new GameEngine(home, away, extraTime, false);
    this.engine.startGame();
    this.timerID = setInterval(
      () => this.updateStatus(),
      1
    );
  }

  updateStatus() {
    const { timer } = this.state;
    if (timer < this.engine.stats.playerPosition.length) {
      this.setState({
        timer: timer + 1,
        score: this.engine.stats.score[timer],
        position: this.engine.stats.playerPosition[timer]
      });
    } else {
      clearInterval(this.timerID);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { score, goalPointer } = this.state;
    if (goalPointer < this.engine.stats.goal.length && (
      score.home !== prevState.score.home ||
      score.away !== prevState.score.away)) {
      const { possession, playerName, time } = this.engine.stats.goal[goalPointer];
      if (possession === 'home') {
        this.setState(state => ({
          goalHome: state.goalHome.concat([{ playerName, time }]),
          goalPointer: goalPointer + 1
        }));
      } else {
        this.setState(state => ({
          goalAway: state.goalAway.concat([{ playerName, time }]),
          goalPointer: goalPointer + 1
        }));
      }
    }
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

  drawTimer(timer) {
    const minitues = Number.parseInt(timer / 60);
    const seconds = timer % 60;
    return `${this.formatNumber(minitues)} : ${this.formatNumber(seconds)}`;
  }

  drawFormation(playerStyle, playerIcon) {
    // TODO: draw the ball
    return (
      <div className="game-presentation__formation">
        {
          GameEngine.fieldPosAll.map(playerPos => {
            return (
              playerStyle[playerPos].map((style, index) => {
                return (
                  <img
                    key={`${playerPos}-${index}`}
                    src={playerIcon}
                    alt="player-icon"
                    style={style}
                    className="game-presentation__player-icon"
                  />
                );
              })
            );
          })
        }
      </div>
    );
  }

  render() {
    const { home, away, handleEndGame } = this.props;
    const { timer, score, position, goalHome, goalAway } = this.state;
    return (
      <div className="game-visualizer">
        <div className="game-visualizer__timer">
          <h1>{this.drawTimer(timer)}</h1>
        </div>
        <div className="scoreboard">
          <div className="scoreboard__team">
            <img 
              src={homePlayerIcon}
              alt="home-shirt-color"
              className="scoreboard__home-shirt"
            />
            <h1>{home.teamName}</h1>
          </div>
          <div className="scoreboard__score">
            <h1>{score.home} : {score.away}</h1>
          </div>
          <div className="scoreboard__team">
            <h1>{away.teamName}</h1>
            <img 
              src={awayPlayerIcon}
              alt="away-shirt-color"
              className="scoreboard__away-shirt"
            />
          </div>
        </div>
        <div className="game-record">
          <div className="game-record__team">
            {
              goalHome.map((scoringRecord, index) => {
                return (
                  <div key={index} className="game-record__record">
                    <p>{scoringRecord.playerName}</p>
                    <img
                      src={soccerIcon}
                      alt="football"
                      className="game-record__image"
                    />
                    <p>{scoringRecord.time}'</p>
                  </div>
                );
              })
            }
          </div>
          <div className="game-record__blank"></div>
          <div className="game-record__team">
            {
              goalAway.map((scoringRecord, index) => {
                return (
                  <div key={index} className="game-record__record">
                    <p>{scoringRecord.playerName}</p>
                    <img
                      src={soccerIcon}
                      alt="football"
                      className="game-record__image"
                    />
                    <p>{scoringRecord.time}'</p>
                  </div>
                );
              })
            }
          </div>
        </div>
        {
          position &&
          <div className="game-presentation">
            {this.drawFormation(position.homeStyle, homePlayerIcon)}
            {this.drawFormation(position.awayStyle, awayPlayerIcon)}
          </div>
        }
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
