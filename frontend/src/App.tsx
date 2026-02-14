import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import School from './pages/School';
import VerifyEmail from './pages/VerifyEmail';
import CreateSchool from './pages/CreateSchool';
import About from './pages/About';
import AuthorizedDomains from './pages/AuthorizedDomains';
import SearchLanding from './pages/SearchLanding';
import SchoolMap from './pages/SchoolMap';
import StudentSearch from './pages/StudentSearch';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/authorized-domains" element={<AuthorizedDomains />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchLanding />} />
          <Route path="/map" element={<SchoolMap />} />
          <Route path="/students" element={<StudentSearch />} />
          <Route path="/school/:name" element={<School />} />
          <Route path="/create-school" element={<CreateSchool />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
