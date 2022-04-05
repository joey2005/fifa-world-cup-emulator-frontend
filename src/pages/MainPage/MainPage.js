import { Link } from "react-router-dom";
import './MainPage.scss';

function MainPage() {
  return (
    <section className="main">
      <div className="main__title-box">
        <h1 className="main__title">
          Welcome to FIFA World Cup Emulator
        </h1>
      </div>
      <div className="main__options">
        <Link to="/teams" className="link">
          <div className="button">
            <p className="button__text">
              view / edit teams
            </p>
          </div>
        </Link>
        <Link to="/games" className="link">
          <div className="button">
            <p className="button__text">
              play matches
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default MainPage;
