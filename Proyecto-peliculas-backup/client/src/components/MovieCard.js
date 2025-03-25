// src/components/MovieCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const MovieCard = ({ movie, showStreamingInfo = false }) => {
    const { theme } = useTheme();
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

    const cardClass = theme === 'dark'
        ? 'card bg-dark text-white'
        : 'card bg-light text-dark';

    const renderStreamingPlatforms = () => {
        if (!showStreamingInfo || !movie.streaming_info) return null;

        return (
            <div className="streaming-info mt-2">
                {Object.entries(movie.streaming_info).map(([type, platforms]) => (
                    <div key={type} className="mb-2">
                        <small className={theme === 'dark' ? 'text-light' : 'text-dark'}>
                            {type}:
                        </small>
                        <div className="platform-list">
                            {platforms.map((platform, index) => (
                                <span key={index} className="badge bg-primary me-1">
                                    {platform.platform}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={`${cardClass} h-100 movie-card`}>
            <img
                src={movie.poster_path ? `${imageBaseUrl}${movie.poster_path}` : '/placeholder.jpg'}
                className="card-img-top"
                alt={movie.title}
                style={{ height: '400px', objectFit: 'cover' }}
            />

            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{movie.title}</h5>

                <div className="movie-info">
                    <p className="mb-1">
                        <small className="text-warning">⭐ {movie.vote_average?.toFixed(1)}</small>
                        {movie.release_date && (
                            <small className={`ms-2 ${theme === 'dark' ? 'text-light' : 'text-muted'}`}>
                                {new Date(movie.release_date).getFullYear()}
                            </small>
                        )}
                    </p>
                </div>

                <p className={`card-text flex-grow-1 ${theme === 'dark' ? 'text-light' : 'text-dark'}`}>
                    {movie.overview?.slice(0, 100)}...
                </p>

                {renderStreamingPlatforms()}

                <Link
                    to={`/movie/${movie.id || movie.tmdb_id}`}
                    className="btn btn-warning mt-auto"
                >
                    Ver más
                </Link>
            </div>
        </div>
    );
};

export default MovieCard;