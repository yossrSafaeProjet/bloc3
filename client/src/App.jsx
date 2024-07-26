import HomePage from './components/HomePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Dashbord from './components/Dashbord';
import InscriptionClient from './components/InscriptionClient';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashbord />} />
          <Route path="/edit/:id" element={<InscriptionClient mode="edit"/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;