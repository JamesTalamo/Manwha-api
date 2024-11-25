const cors = require('cors');
require('dotenv').config(); 

const allowedOrigins = process.env.allowedOrigins.split(','); 

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}

module.exports = cors(corsOptions);
