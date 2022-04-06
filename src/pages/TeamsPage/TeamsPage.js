import React, { Component } from 'react';
import axios from 'axios';
import TeamCard from '../../components/TeamCard/TeamCard';
import './TeamsPage.scss';

class TeamsPage extends Component {
  state = {
    teamsData: []
  }

  componentDidMount() {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/teams`)
      .then(res => {
        this.setState({
          teamsData: res.data
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const { teamsData } = this.state;
    return (
      <div className="teams">
        {
          teamsData.map(team => {
            return (
              <TeamCard 
                key={team.teamID}
                teamID={team.teamID}
                teamName={team.teamName}
                country_flag={team.country_flag}
              />
            );
          })
        }
      </div>
    );
  }
}

export default TeamsPage;
