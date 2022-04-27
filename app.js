const express = require('express');
const cors = require('cors');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

app.listen(port, () => {
    console.log(`Server is running at ${baseUrl}`);
});
