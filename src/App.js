import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import TeamsPage from './pages/TeamsPage/TeamsPage';
import TeamInfo from './components/TeamInfo/TeamInfo';
import './App.scss';

function App() {
  return (
    <Router>
      <div className="wrapper">
        <Switch>
          <Route path="/" exact component={MainPage} />
          <Route path="/teams" exact component={TeamsPage} />
          <Route path="/teams/:teamID" component={TeamInfo} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
