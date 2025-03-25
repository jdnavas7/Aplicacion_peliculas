const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Verificar variables de entorno
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3001; // Cambiado a 3001 para evitar conflictos con React

// Configuración de APIs
const TMDB_API_KEY = '3f51e3a7b21bff7b24520904b2e44639';
const WATCHMODE_API_KEY = 'W9qDPTeEvUktj3pO6EHu4u1BuKZSFktZN3U7GfAN';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

// Verificar MongoDB
if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI no está definida en el archivo .env');
    process.exit(1);
}

// Esquema para películas
const movieSchema = new mongoose.Schema({
    tmdb_id: Number,
    title: String,
    overview: String,
    release_date: Date,
    vote_average: Number,
    poster_path: String,
    genres: [String],
    saved_date: {
        type: Date,
        default: Date.now
    }
});

const Movie = mongoose.model('Movie', movieSchema);

// Inicialización de Express
const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Función para traducir nombres de plataformas
function translatePlatformName(name) {
    const platforms = {
        'Netflix': 'Netflix',
        'Amazon Prime Video': 'Prime Video',
        'Disney Plus': 'Disney+',
        'HBO Max': 'HBO Max',
        'Movistar Plus': 'Movistar+',
        'Apple TV Plus': 'Apple TV+',
        'Google Play Movies': 'Google Play',
        'Microsoft Store': 'Microsoft Store',
        'YouTube': 'YouTube',
        'Filmin': 'Filmin',
        'Rakuten TV': 'Rakuten TV'
    };
    return platforms[name] || name;
}

// Función para traducir tipos de fuente
function translateSourceType(type) {
    const types = {
        'free': 'Gratis',
        'ads': 'Gratis con anuncios',
        'subscription': 'Suscripción',
        'rent': 'Alquiler',
        'buy': 'Compra',
        'cinema': 'En cines'
    };
    return types[type] || type;
}

// Función para buscar por título en Watchmode
async function searchByTitle(title) {
    try {
        console.log('Buscando información para:', title);
        const searchResponse = await axios.get(`${WATCHMODE_BASE_URL}/search`, {
            params: {
                apiKey: WATCHMODE_API_KEY,
                search_field: 'name',
                search_value: title,
                types: 'movie'
            }
        });

        if (searchResponse.data.title_results && searchResponse.data.title_results.length > 0) {
            const watchmodeId = searchResponse.data.title_results[0].id;
            console.log('ID de Watchmode encontrado:', watchmodeId);

            const sourcesResponse = await axios.get(`${WATCHMODE_BASE_URL}/title/${watchmodeId}/sources`, {
                params: {
                    apiKey: WATCHMODE_API_KEY,
                    regions: 'ES'
                }
            });

            const sources = sourcesResponse.data.map(source => ({
                platform: translatePlatformName(source.name),
                type: translateSourceType(source.type),
                price: source.price ? `${source.price}€` : null,
                url: source.web_url,
                quality: source.format || 'HD',
                region: 'ES'
            }));

            const groupedSources = sources.reduce((acc, source) => {
                if (!acc[source.type]) {
                    acc[source.type] = [];
                }
                if (!acc[source.type].some(s => s.platform === source.platform)) {
                    acc[source.type].push(source);
                }
                return acc;
            }, {});

            return {
                success: true,
                data: groupedSources
            };
        }
        return { success: false, message: 'No se encontraron resultados' };
    } catch (error) {
        console.error('Error en búsqueda:', error.message);
        return { success: false, error: error.message };
    }
}

// Rutas de la API

// GET /movies/popular - Obtener películas populares
app.get('/movies/popular', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'es-ES',
                page
            }
        });

        res.json({
            status: "success",
            data: response.data.results,
            page: response.data.page,
            total_pages: response.data.total_pages,
            message: "Películas populares recuperadas con éxito"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error al obtener películas populares",
            error: error.message
        });
    }
});

// GET /movies/genres - Obtener lista de géneros
app.get('/movies/genres', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'es-ES'
            }
        });

        res.json({
            status: "success",
            data: response.data.genres,
            message: "Géneros recuperados con éxito"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error al obtener los géneros",
            error: error.message
        });
    }
});

// GET /movies/search - Buscar películas
app.get('/movies/search', async (req, res) => {
    try {
        const { query, genres } = req.query;
        const page = parseInt(req.query.page) || 1;

        // Si hay query, usamos search/movie, si no, discover/movie
        const endpoint = query ? 'search/movie' : 'discover/movie';

        const params = {
            api_key: TMDB_API_KEY,
            language: 'es-ES',
            page,
            include_adult: false
        };

        if (query) {
            params.query = query;
        }

        if (genres) {
            params.with_genres = genres;
        }

        const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, { params });

        res.json({
            status: "success",
            data: response.data.results,
            total_pages: response.data.total_pages,
            message: "Búsqueda realizada con éxito"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error en la búsqueda",
            error: error.message
        });
    }
});

// GET /movies/:id - Obtener detalles de película con información de streaming
app.get('/movies/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const movieResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'es-ES',
                append_to_response: 'videos,credits'
            }
        });

        const streamingInfo = await searchByTitle(movieResponse.data.title);
        const hasStreamingInfo = streamingInfo.success && Object.keys(streamingInfo.data).length > 0;

        res.json({
            status: "success",
            data: {
                ...movieResponse.data,
                streaming_info: hasStreamingInfo ? streamingInfo.data : {},
                has_streaming_info: hasStreamingInfo
            },
            message: hasStreamingInfo
                ? "Detalles y streaming recuperados con éxito"
                : "Detalles recuperados, sin información de streaming disponible"
        });
    } catch (error) {
        console.error('Error completo:', error);
        res.status(500).json({
            status: "error",
            message: "Error al obtener detalles de la película",
            error: error.message
        });
    }
});

// POST /movies/save - Guardar película
app.post('/movies/save', async (req, res) => {
    try {
        const movieId = req.body.tmdb_id;
        const existingMovie = await Movie.findOne({ tmdb_id: movieId });
        if (existingMovie) {
            return res.status(400).json({
                status: "error",
                message: "Esta película ya está guardada"
            });
        }

        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'es-ES'
            }
        });

        const movieData = {
            tmdb_id: response.data.id,
            title: response.data.title,
            overview: response.data.overview,
            release_date: response.data.release_date,
            vote_average: response.data.vote_average,
            poster_path: response.data.poster_path,
            genres: response.data.genres.map(genre => genre.name)
        };

        const movie = new Movie(movieData);
        await movie.save();

        res.status(201).json({
            status: "success",
            data: movie,
            message: "Película guardada con éxito"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error al guardar la película",
            error: error.message
        });
    }
});

// GET /movies/saved - Obtener películas guardadas
app.get('/movies/saved', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ saved_date: -1 });
        res.json({
            status: "success",
            data: movies,
            message: "Películas guardadas recuperadas con éxito"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error al obtener películas guardadas",
            error: error.message
        });
    }
});

// Conectar a MongoDB e iniciar servidor
console.log('🔄 Conectando a MongoDB...');
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado a MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log('\nEndpoints disponibles:');
            console.log('- GET /movies/popular -> Películas populares');
            console.log('- GET /movies/search/:query -> Buscar películas');
            console.log('- GET /movies/:id -> Detalles de película con streaming');
            console.log('- POST /movies/save -> Guardar película');
            console.log('- GET /movies/saved -> Ver películas guardadas');
        });
    })
    .catch(err => {
        console.error('❌ Error al conectar con MongoDB:', err.message);
        process.exit(1);
    });