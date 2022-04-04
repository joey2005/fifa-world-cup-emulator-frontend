import React, { Component } from 'react';
import axios from 'axios';
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
        this.setState({
          team: res.data.find(team => {
            return team.teamID === teamID
          })
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const { team } = this.state;
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
            <p className="team-info__formation">
              <span className="team-info__formation--bold">
                Current Formation:&nbsp;
              </span>
              {}
            </p>
            <p className="team-info__appearance">
              <span className="team-info__appearance--bold">
                2022 FIFA World Cup appearance:&nbsp;
              </span>
              {team.qualified === 'true' ? 'Yes' : 'TBD'}
            </p>
          </div>
        </div>
      </div> :
      <></>
    );
  }
}

export default TeamInfo;
