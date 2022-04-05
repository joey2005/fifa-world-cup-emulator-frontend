import { Link } from 'react-router-dom';
import worldCupIcon from '../../assets/icons/world-cup.svg';
import './PageHeader.scss'

function PageHeader() {
  return (
    <nav className="nav">
      <Link to="/" className="link">
        <div className="nav__logo-box">
          <img
            src={worldCupIcon}
            alt="homeLogo"
            className="nav__logo"
          />
          <p className="nav__logo-text">
            FIFA World Cup Emulator
          </p>
        </div>
      </Link>
      <ul className="nav__list">
        <li className="nav__item">
          <Link to="/" className="link">
            <p className="nav__link-text">Home</p>
          </Link>
        </li>
        <li className="nav__item">
          <Link to="/about" className="link">
            <p className="nav__link-text">About</p>
          </Link>
        </li>
        <li className="nav__item">
          <Link to="/contact" className="link">
            <p className="nav__link-text">Contact</p>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default PageHeader;
