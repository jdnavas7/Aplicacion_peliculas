import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const movieService = {
    // Obtener películas populares
    getPopularMovies: async (page = 1) => {
        try {
            const response = await axios.get(`${BASE_URL}/movies/popular`, {
                params: { page }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            throw error;
        }
    },

    // Buscar películas
    searchMovies: async (query = '', genres = [], page = 1) => {
        try {
            const params = new URLSearchParams();
            if (query) params.append('query', query);
            if (genres.length > 0) params.append('genres', genres.join(','));
            params.append('page', page);

            const response = await axios.get(`${BASE_URL}/movies/search?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error searching movies:', error);
            throw error;
        }
    },

    // Obtener detalles de película
    getMovieDetails: async (movieId) => {
        try {
            const response = await axios.get(`${BASE_URL}/movies/${movieId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching movie details:', error);
            throw error;
        }
    },

    // Guardar película
    saveMovie: async (movieId) => {
        try {
            const response = await axios.post(`${BASE_URL}/movies/save`, { tmdb_id: movieId });
            return response.data;
        } catch (error) {
            console.error('Error saving movie:', error);
            throw error;
        }
    },

    // Obtener películas guardadas
    getSavedMovies: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/movies/saved`);
            return response.data;
        } catch (error) {
            console.error('Error fetching saved movies:', error);
            throw error;
        }
    },

    // Obtener géneros
    getGenres: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/movies/genres`);
            return response.data;
        } catch (error) {
            console.error('Error fetching genres:', error);
            throw error;
        }
    }
};

export default movieService;