import { Link } from 'react-router-dom';
import './PageHeader.scss'

function PageHeader() {
  return (
    <nav className="nav">
      <Link to="/" className="link">
        <p className="nav__logo">
          FIFA World Cup Emulator
        </p>
      </Link>
      <ul className="nav__list">
        <li className="nav__item">
          <Link to="/" className="link">
            <p className="nav__link-text">Home</p>
          </Link>
        </li>
        <li className="nav__item">
          <p className="nav__link-text">About</p>
        </li>
        <li className="nav__item">
          <p className="nav__link-text">Contact</p>
        </li>
      </ul>
    </nav>
  );
}

export default PageHeader;
