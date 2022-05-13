const cookie = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const methodOverride = require('method-override')
const session = require('express-session');
const routes = require('./routes');
const swagger = require('./swagger');

const app = express();

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(cors());
app.use(methodOverride('_method'));
app.use(cookie('secret'));
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(swagger);
app.use(routes);

module.exports = app;
