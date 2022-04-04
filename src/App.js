import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import './App.scss';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={MainPage} />
      </Switch>
    </Router>
  );
}

export default App;
