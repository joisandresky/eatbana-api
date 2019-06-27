module.exports = app => {
    app.use('/api/guests', require('./api/guest'));
    app.use('/api/reservations', require('./api/reservation'));
    app.use('/api/restaurants', require('./api/restaurant'));
    app.use('/api/users', require('./api/user'));
}