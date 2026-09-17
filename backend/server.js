const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const emergencyRoutes = require('./routes/emergency');

const app = express();

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
    'https://aqua-sentinal.netlify.app',
    'https://aqua-sen.netlify.app',
    'http://localhost:4200'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests without an origin,
        // such as Postman or server-to-server requests
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('CORS: Origin not allowed'));
    },

    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
    ],

    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ],

    credentials: true
}));

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
    '/api/auth',
    authRoutes
);

// ==========================================
// EMERGENCY / FIREBASE PUSH ROUTES
// ==========================================

app.use(
    '/api/emergency',
    emergencyRoutes
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'AquaSentinal backend is running.'
    });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `AquaSentinal backend running on port ${PORT}`
    );
});
