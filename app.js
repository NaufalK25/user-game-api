const fs = require('fs');
const path = require('path');
const cookie = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const routes = require('./routes');

const app = express();

if (!fs.existsSync(path.join(__dirname, 'logs'))) {
    fs.mkdirSync(path.join(__dirname, 'logs'));

    if (!fs.existsSync(path.join(__dirname, 'logs', 'access.log'))) {
        fs.writeFileSync(path.join(__dirname, 'logs', 'access.log'), '');
    }

    if (!fs.existsSync(path.join(__dirname, 'logs', 'error.log'))) {
        fs.writeFileSync(path.join(__dirname, 'logs', 'error.log'), '');
    }
}

const createLogStream = (logStream) => {
    return fs.createWriteStream(path.join(__dirname, 'logs', `${logStream}.log`), { flags: 'a' });
}
const accessLogStream = createLogStream('access');
const errorLogStream = createLogStream('error');
const fileLogFormat = ':remote-addr - :remote-user [:date[web]] ":method :url HTTP/:http-version" :status :res[content-length] :body ":referrer" ":user-agent"';
const terminalLogFormat = ':method :url :status :body :response-time ms';

morgan.token('body', (req, res) => JSON.stringify(req.body));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(cors());
app.use(methodOverride('_method'));
app.use(cookie('secret'));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan(fileLogFormat, { stream: accessLogStream }));
app.use(morgan(fileLogFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: errorLogStream
}));
app.use(morgan(terminalLogFormat, { skip: (req, res) => res.statusCode >= 400 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(routes);

module.exports = app;
