import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import movieService from '../services/api';

function SearchPage() {
    const [searchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const searchMovies = async () => {
            try {
                setIsLoading(true);
                const query = searchParams.get('query');
                const genres = searchParams.get('genres');
                const response = await movieService.searchMovies(query, genres ? genres.split(',') : []);
                setMovies(response.data);
                setError(null);
            } catch (err) {
                setError('Error al buscar películas');
            } finally {
                setIsLoading(false);
            }
        };

        searchMovies();
    }, [searchParams]);

    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
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
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="text-white mb-4">
                Resultados de búsqueda
                {searchParams.get('query') && ` para: "${searchParams.get('query')}"`}
            </h2>

            {movies.length === 0 ? (
                <div className="alert alert-info">
                    No se encontraron películas.
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {movies.map(movie => (
                        <div key={movie.id} className="col">
                            <div className="card bg-dark text-white h-100" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    className="card-img-top"
                                    alt={movie.title}
                                    style={{ height: '400px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                                    }}
                                />
                                <div className="card-body d-flex flex-column" style={{ backgroundColor: '#1a1a1a' }}>
                                    <h5 className="card-title mb-2">{movie.title}</h5>
                                    <div className="mb-2">
                                        <span className="text-warning me-2">
                                            ⭐ {movie.vote_average?.toFixed(1)}
                                        </span>
                                    </div>
                                    <p className="card-text flex-grow-1" style={{ fontSize: '0.9rem', color: '#d1d1d1' }}>
                                        {truncateText(movie.overview, 150)}
                                    </p>
                                    <Link
                                        to={`/movie/${movie.id}`}
                                        className="btn btn-warning w-100 mt-3"
                                        style={{
                                            backgroundColor: '#ffc107',
                                            borderColor: '#ffc107',
                                            color: '#000'
                                        }}
                                    >
                                        Ver más
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchPage;