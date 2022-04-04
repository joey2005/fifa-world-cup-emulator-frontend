import React, { Component } from 'react';
import axios from 'axios';
import Formation from '../../components/Formation/Formation';
import './TeamInfo.scss';

class TeamInfo extends Component {
  state = {
    team: {}
  }

  componentDidMount() {
    const { teamID } = this.props.match.params;
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/teams`)
      .then(res => {
        const team = res.data.find(team => {
          return team.teamID === teamID
        });
        this.setState({
          team,
          formation: team.formation
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleFormationChange = (selectedOption) => {
    this.setState({
      formation: selectedOption.value
    });
  }

  submitFormationChange = (event) => {
    event.preventDefault();
    const { formation } = this.state;
    const { teamID } = this.state.team;
    axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/teams/${teamID}`,
        {
          formation: formation
        }
      )
      .then(res => {
        const team = res.data.find(team => {
          return team.teamID === teamID
        });
        this.setState({
          team,
          formation: team.formation
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const { team, formation } = this.state;
    return (
      team.teamID ?
      <div className="team-info">
        <div className="team-info__header">
          <div className="team-info__country-flag">
            <img
              src={team.country_flag}
              alt={team.teamName}
              className="team-info__image"
            />
          </div>
          <div className="team-info__description">
            <h1 className="team-info__name">
              {team.teamName}
            </h1>
            <p className="team-info__ranking">
              <span className="team-info__ranking--bold">
                Current Ranking:&nbsp;
              </span>
              {team.teamID}
            </p>
            <p className="team-info__record">
              <span className="team-info__record--bold">
                Best Record:&nbsp;
              </span>
              {team.record}
            </p>
            <p className="team-info__coach">
              <span className="team-info__coach--bold">
                Head Coach:&nbsp;
              </span>
              {team.coach}
            </p>
            <p className="team-info__appearance">
              <span className="team-info__appearance--bold">
                2022 FIFA World Cup appearance:&nbsp;
              </span>
              {team.qualified === 'true' ? 'Yes' : 'TBD'}
            </p>
          </div>
        </div>
        <Formation
          formation={formation}
          handleFormationChange={this.handleFormationChange}
          submitFormationChange={this.submitFormationChange}
        />
      </div> :
      <></>
    );
  }
}

export default TeamInfo;
