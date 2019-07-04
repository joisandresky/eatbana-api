const _ = require('lodash');
const Q = require('q');
const Guest = require('./guest.model');
const User = require('../user/user.model');

//membuat function
exports.index = function (req, res) {
    // http://localhost:5000/api/guests?page=1&limit=10
    let page = Number(req.query.page) || 1,
        limit = Number(req.query.limit) || 10,
        skip = (page - 1) * limit;

    //proses async
    Q.all([
        Guest.count(), //total data
        Guest.find().skip(skip).limit(limit) //jumlah data
    ])
        .spread(function (total, guests) {
            res.status(200).json({ total, guests });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.search = function (req, res) {
    //http://localhost:5000/api/jobs/search?value=xdfgchgvjh
    Guest.find({ name: { $regex: req.query.value, $options: 'i' } }).exec(function (err, guests) {
        if (err) return res.status(500).send(err);

        res.status(200).json(guests);
    });
};

exports.show = function (req, res) {
    //http://localhost:5000/api/guests/234567890
    Guest.findOne({ _id: req.params.id }).populate('user').lean().exec(function (err, guest) {
        if (err) return res.status(500).send(err);
        if (!guest) return res.status(404).json({ message: 'Guest Not Found! ' });

        delete guest.user.password;
        res.status(200).json(guest);
    });
};

exports.getGuestbyUser = function (req, res) {
    Guest.findOne({ user: req.params.id }).populate('user').lean().exec(function (err, guest) {
        if (err) return res.status(500).send(err);
        if (!guest) return res.status(404).json({ message: 'Guest Not Found! ' });

        delete guest.user.password;
        res.status(200).json(guest);
    });
}

exports.create = function (req, res) {
    let newUser = {
        email: req.body.email,
        password: req.body.password,
        role: 'guest'
    };
    User.create(newUser, function (err, user) {
        if (err) return res.status(500).send(err);
        console.log('user created', user);

        req.body.user = user._id;
        Guest.create(req.body, function (err, guest) {
            if (err) return res.status(500).send(err);

            res.status(201).send(guest);
        });
    });
}

exports.update = function (req, res) {
    //http://localhost:5000/api/guests/234567890

    if (req.body._id) delete req.body._id;
    Guest.findOne({ _id: req.params.id }).exec(function (err, guest) {
        if (err) return res.status(500).send(err);
        if (!guest) return res.status(404).json({ message: 'Guest Not Found! ' });

        let updated = _.merge(guest, req.body);
        updated.save(function (err) {
            if (err) return res.status(500).send(err);

            res.status(200).json({ massage: 'Guest Updated', guest: updated });
        });
    });
}

exports.destroy = function (req, res) {

    Guest.findOne({ _id: req.params.id }).exec(function (err, guest) {
        if (err) return res.status(500).send(err);
        if (!guest) return res.status(404).json({ message: 'Guest Not Found! ' });

        guest.remove(function (err) {
            if (err) return res.status(500).send(err);

            res.status(200).json({ massage: 'Job Deleted!' });
        });
    });
}