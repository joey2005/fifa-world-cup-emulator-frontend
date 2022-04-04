import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PageHeader from './components/PageHeader/PageHeader';
import MainPage from './pages/MainPage/MainPage';
import TeamsPage from './pages/TeamsPage/TeamsPage';
import TeamInfo from './components/TeamInfo/TeamInfo';
import bg1 from './assets/images/stadium-1.jpg';
import bg2 from './assets/images/stadium-2.jpg';
import bg3 from './assets/images/stadium-3.jpg';
import bg4 from './assets/images/stadium-4.jpg';
import bg5 from './assets/images/stadium-5.jpg';
import bg6 from './assets/images/stadium-6.jpg';
import './App.scss';

function App() {
  return (
    <Router>
      <div className="wrapper">
        <div className="wrapper__background">
          <img src={bg6} alt="background-6" />
          <img src={bg5} alt="background-5" />
          <img src={bg4} alt="background-4" />
          <img src={bg3} alt="background-3" />
          <img src={bg2} alt="background-2" />
          <img src={bg1} alt="background-1" />
        </div>
        <PageHeader />
        <div className="wrapper__main">
          <Switch>
            <Route path="/" exact component={MainPage} />
            <Route path="/teams" exact component={TeamsPage} />
            <Route path="/teams/:teamID" component={TeamInfo} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
