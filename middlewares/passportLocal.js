const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { UserGame } = require('../database/models');

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        const user = await UserGame.findOne({ where: { username } })
        if (!user) return done(null, false, { param: 'username', message: 'User not found' });
        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) return done(null, false, { param: 'password', message: 'Incorrect password' });
        return done(null, user, { message: 'Logged in Successfully' });
    } catch (err) {
        return done(err, false, { param: 'error', message: 'Error while trying to log in' });
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (userId, done) => {
    try {
        const userGame = await UserGame.findByPk(userId);
        if (userGame) return done(null, userGame);
        return done(null, false);
    } catch (err) {
        return done(err, false);
    }
});

module.exports = passport;
