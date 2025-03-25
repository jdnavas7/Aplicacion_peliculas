// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import movieService from '../services/api';
import MovieCard from '../components/MovieCard';
import { useTheme } from '../context/ThemeContext';

function HomePage() {
    const { theme } = useTheme();
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const loadMovies = async () => {
            try {
                setIsLoading(true);
                const response = await movieService.getPopularMovies(currentPage);
                setMovies(response.data);
                setTotalPages(response.total_pages);
                setError(null);
            } catch (err) {
                setError('Error al cargar las películas. Por favor, intenta de nuevo más tarde.');
            } finally {
                setIsLoading(false);
            }
        };

        loadMovies();
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    const renderPagination = () => {
        const paginationTheme = theme === 'dark' ? 'pagination-dark' : 'pagination-light';

        return (
            <nav aria-label="Navegación de páginas">
                <ul className={`pagination justify-content-center ${paginationTheme}`}>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                    </li>
                    <li className="page-item active">
                        <span className="page-link">
                            Página {currentPage} de {totalPages}
                        </span>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    const textClass = theme === 'dark' ? 'text-light' : 'text-dark';
    const spinnerClass = theme === 'dark' ? 'text-light' : 'text-dark';

    return (
        <div className={`container py-4 ${theme}`}>
            <header className="text-center mb-5">
                <h1 className={`display-4 ${textClass}`}>DondeVer</h1>
                <p className={`lead ${textClass}`}>
                    Busca la película que quieras ver y descubre en que plataforma se encuentra disponible
                </p>
            </header>

            {isLoading ? (
                <div className="text-center">
                    <div className={`spinner-border ${spinnerClass}`} role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            ) : (
                <>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {movies.map(movie => (
                            <div className="col" key={movie.id}>
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                    <div className="mt-5">
                        {renderPagination()}
                    </div>
                </>
            )}
        </div>
    );
}

export default HomePage;