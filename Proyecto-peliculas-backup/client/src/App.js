// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import SearchPage from './pages/SearchPage';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

// Componente de navegación que usa el tema
function Navigation() {
    const { theme } = useTheme();
    const navbarClass = theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light';

    return (
        <nav className={`navbar navbar-expand-lg ${navbarClass}`}>
            <div className="container">
                <Link className="navbar-brand" to="/">
                    🎬 DondeVer
                </Link>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Inicio</Link>
                        </li>
                    </ul>
                    <SearchBar />
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}

// Componente principal envuelto en ThemeProvider
function AppContent() {
    const { theme } = useTheme();

    return (
        <div className={`App ${theme}`}>
            <Navigation />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movie/:id" element={<MovieDetailsPage />} />
                <Route path="/search" element={<SearchPage />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
}

export default App;