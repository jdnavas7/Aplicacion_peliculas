// src/components/SearchBar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import movieService from '../services/api';
import './SearchBar.css';

function SearchBar() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [showGenreFilter, setShowGenreFilter] = useState(false);

    useEffect(() => {
        const loadGenres = async () => {
            try {
                const response = await movieService.getGenres();
                setGenres(response.data);
            } catch (error) {
                console.error('Error cargando géneros:', error);
            }
        };
        loadGenres();
    }, []);

    const handleGenreToggle = (genreId) => {
        setSelectedGenres(prevGenres => {
            if (prevGenres.includes(genreId)) {
                return prevGenres.filter(id => id !== genreId);
            } else {
                return [...prevGenres, genreId];
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();

        if (searchTerm.trim()) {
            params.append('query', searchTerm.trim());
        }

        if (selectedGenres.length > 0) {
            params.append('genres', selectedGenres.join(','));
        }

        navigate(`/search?${params.toString()}`);
    };

    // Clases condicionales basadas en el tema
    const inputClass = theme === 'dark'
        ? 'form-control bg-dark text-light'
        : 'form-control bg-light text-dark';
    const genreButtonClass = theme === 'dark'
        ? 'btn btn-outline-light'
        : 'btn btn-outline-dark';
    const dropdownClass = theme === 'dark'
        ? 'genre-dropdown dark'
        : 'genre-dropdown light';

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className="search-container">
                <div className="input-group">
                    <input
                        type="search"
                        className={inputClass}
                        placeholder="Buscar películas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        type="button"
                        className={genreButtonClass}
                        onClick={() => setShowGenreFilter(!showGenreFilter)}
                    >
                        🏷️ Géneros
                    </button>
                    <button type="submit" className="btn btn-warning">
                        🔍 Buscar
                    </button>
                </div>

                {showGenreFilter && genres.length > 0 && (
                    <div className={dropdownClass}>
                        <div className="genre-list">
                            {genres.map(genre => (
                                <div key={genre.id} className="genre-item">
                                    <label className={`genre-label ${theme}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedGenres.includes(genre.id)}
                                            onChange={() => handleGenreToggle(genre.id)}
                                        />
                                        <span className="ms-2">{genre.name}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedGenres.length > 0 && (
                    <div className="selected-genres">
                        {selectedGenres.map(genreId => {
                            const genre = genres.find(g => g.id === genreId);
                            return genre && (
                                <span key={genreId} className="badge bg-secondary me-1">
                                    {genre.name}
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white ms-2"
                                        onClick={() => handleGenreToggle(genreId)}
                                    />
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        </form>
    );
}

export default SearchBar;