import { Link } from 'react-router-dom';
import './TeamCard.scss';

function TeamCard(props) {
  const { teamID, teamName, country_flag } = props;
  return (
    <Link to={`/teams/${teamID}`} className="link team-card">
      <img src={country_flag} alt={teamName} className="team-card__image" />
      <h2 className="team-card__name">
        {teamName}
      </h2>
    </Link>
  );
}

export default TeamCard;
