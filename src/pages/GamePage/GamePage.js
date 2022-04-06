import { Link } from 'react-router-dom';
import './GamePage.scss';

function GamePage() {
  return (
    <section className="select-game">
      <div className="select-game__title-box">
        <h1 className="select__title">
          Which type of match do you want to play?
        </h1>
      </div>
      <div className="select-game__options">
        <Link to="/games/friendly" className="link">
          <div className="button">
            <p className="button__text">
              play a single match
            </p>
          </div>
        </Link>
        <Link to="/games/tournament" className="link">
          <div className="button">
            <p className="button__text">
              play a tournament
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default GamePage;
