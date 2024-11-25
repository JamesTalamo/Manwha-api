const express = require('express')
const app = express()
require('dotenv').config()

app.use(express.json());
app.use(express.static('public'))

app.use(require('./config/cors.js'));

app.use('/api', require('./Routes/Routes.js'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Connected on PORT :${PORT}`))