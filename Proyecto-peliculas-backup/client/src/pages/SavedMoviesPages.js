import React, { useState, useEffect } from 'react';
import movieService from '../services/api';
import MovieCard from '../components/MovieCard';

function SavedMoviesPage() {
    // Configuramos los estados necesarios para manejar las películas guardadas
    const [savedMovies, setSavedMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Este efecto se ejecuta cuando el componente se monta
    // y se encarga de cargar las películas guardadas desde el backend
    useEffect(() => {
        const loadSavedMovies = async () => {
            try {
                setIsLoading(true);
                const response = await movieService.getSavedMovies();

                // Ordenamos las películas por fecha de guardado, las más recientes primero
                const sortedMovies = response.data.sort((a, b) =>
                    new Date(b.saved_date) - new Date(a.saved_date)
                );

                setSavedMovies(sortedMovies);
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar las películas guardadas. Por favor, intenta de nuevo más tarde.');
            } finally {
                setIsLoading(false);
            }
        };

        loadSavedMovies();
    }, []); // El array vacío significa que solo se ejecuta al montar el componente

    // Función para formatear la fecha de guardado
    const formatSavedDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    return (
        <div className="container py-4">
            {/* Cabecera de la página */}
            <header className="text-center mb-5">
                <h1 className="display-4">Mis Películas Guardadas</h1>
                <p className="lead">
                    {isLoading ? 'Cargando tu colección...' :
                        error ? 'Error al cargar las películas' :
                            savedMovies.length === 0 ? 'No tienes películas guardadas todavía' :
                                `Tienes ${savedMovies.length} película${savedMovies.length === 1 ? '' : 's'} en tu colección`}
                </p>
            </header>

            {/* Manejo de estados de carga y error */}
            {isLoading ? (
                <div className="text-center">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            ) : savedMovies.length === 0 ? (
                <div className="text-center">
                    <div className="alert alert-info" role="alert">
                        No has guardado ninguna película todavía.
                        <br />
                        Explora las películas populares o busca tus películas favoritas para empezar tu colección.
                    </div>
                </div>
            ) : (
                // Grid de películas guardadas
                <div className="saved-movies">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {savedMovies.map(movie => (
                            <div className="col" key={movie._id}>
                                <div className="saved-movie-container">
                                    <MovieCard movie={movie} />
                                    <div className="saved-date text-muted mt-2">
                                        <small>
                                            Guardada el: {formatSavedDate(movie.saved_date)}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SavedMoviesPage;