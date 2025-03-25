import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import movieService from '../services/api';
import './MovieDetailsPage.css';

function MovieDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMovieDetails = async () => {
            try {
                setIsLoading(true);
                const response = await movieService.getMovieDetails(id);
                setMovie(response.data);
                setError(null);
            } catch (err) {
                setError('No se pudo cargar la información de la película');
            } finally {
                setIsLoading(false);
            }
        };

        loadMovieDetails();
    }, [id]);

    const handleSaveMovie = async () => {
        try {
            const movieData = {
                tmdb_id: movie.id,
                title: movie.title,
                overview: movie.overview,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                poster_path: movie.poster_path,
                genres: movie.genres.map(genre => genre.name)
            };

            await movieService.saveMovie(movie.id);
            alert('Película guardada con éxito');
        } catch (error) {
            if (error.response?.status === 400) {
                alert('Esta película ya está en tu lista de guardados');
            } else {
                alert('Error al guardar la película');
            }
        }
    };

    const renderStreamingInfo = () => {
        if (!movie.streaming_info || Object.keys(movie.streaming_info).length === 0) {
            return (
                <div className="alert alert-info">
                    No hay información de streaming disponible para esta película.
                </div>
            );
        }

        const getStreamingType = (type) => {
            const types = {
                'sub': 'Suscripción',
                'alquiler': 'Alquiler',
                'compra': 'Compra'
            };
            return types[type] || type;
        };

        return (
            <div className="streaming-section">
                <h3 className="mb-4">Dónde ver</h3>
                {Object.entries(movie.streaming_info).map(([type, platforms]) => (
                    <div key={type} className="mb-4">
                        <h4 className="streaming-title">
                            {getStreamingType(type)}
                        </h4>
                        <div className="row g-3 mt-2">
                            {platforms.map((platform, index) => (
                                <div key={index} className="col-md-4">
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <h5 className="card-title text-white">
                                                {platform.platform}
                                            </h5>
                                            {platform.price && (
                                                <p className="card-text text-price">
                                                    Precio: {platform.price}
                                                </p>
                                            )}
                                            {platform.url && (
                                                <a
                                                    href={platform.url}
                                                    className="btn-ver-ahora"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Ver ahora
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    {error}
                    <button
                        className="btn btn-outline-danger ms-3"
                        onClick={() => navigate(-1)}
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    if (!movie) return null;

    return (
        <div className="movie-details py-5">
            <div
                className="movie-backdrop"
                style={{
                    backgroundImage: movie.backdrop_path
                        ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                        : 'none',
                    height: '400px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                }}
            >
                <div className="backdrop-overlay"></div>
            </div>

            <div className="container position-relative">
                <div className="row">
                    <div className="col-md-4">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="img-fluid rounded shadow-lg"
                        />
                    </div>

                    <div className="col-md-8">
                        <h1 className="display-4 mb-3">{movie.title}</h1>

                        <div className="movie-meta mb-4">
                            <span className="badge bg-warning text-dark me-2">
                                ⭐ {movie.vote_average?.toFixed(1)}
                            </span>
                            {movie.release_date && (
                                <span className="text-muted">
                                    {new Date(movie.release_date).getFullYear()}
                                </span>
                            )}
                            {movie.genres?.map(genre => (
                                <span
                                    key={genre.id}
                                    className="badge bg-secondary ms-2"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>

                        <p className="lead mb-4">{movie.overview}</p>

                        <button
                            className="btn btn-warning mb-4"
                            onClick={handleSaveMovie}
                        >
                            💾 Guardar película
                        </button>

                        {renderStreamingInfo()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieDetailsPage;