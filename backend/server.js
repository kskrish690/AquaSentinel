const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
    '/api/auth',
    authRoutes
);


// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {

    res.json({

        success: true,

        message: 'aquasentinal backend is running.'

    });

});


// ==========================================
// START SERVER
// ==========================================


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`aquasentinal backend running on port ${PORT}`);
});
