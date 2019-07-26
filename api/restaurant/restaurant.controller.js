const _ = require('lodash');
const Q = require('q');
const Restaurant = require('./restaurant.model');
const User = require('../user/user.model');

//membuat function
exports.index = function (req, res) {
    // http://localhost:5000/api/restaurants?page=1&limit=10
    let page = Number(req.query.page) || 1,
        limit = Number(req.query.limit) || 10,
        skip = (page - 1) * limit;

    //proses async
    Q.all([
        Restaurant.count(), //total data
        Restaurant.find().skip(skip).limit(limit) //jumlah data
    ])
        .spread(function (total, restaurants) {
            res.status(200).json({ total, restaurants });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.search = function (req, res) {
    //http://localhost:5000/api/jobs/search?value=xdfgchgvjh
    Restaurant.find({ name: { $regex: req.query.value, $options: 'i' } }).exec(function (err, restaurants) {
        if (err) return res.status(500).send(err);

        res.status(200).json(restaurants);
    });
};

exports.show = function (req, res) {
    //http://localhost:5000/api/restaurants/234567890
    Restaurant.findOne({ _id: req.params.id }).exec(function (err, restaurant) {
        if (err) return res.status(500).send(err);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant Not Found! ' });

        res.status(200).json(restaurant);
    });
};

exports.create = function (req, res) {
    let newUser = {
        email: req.body.email,
        password: req.body.password,
        role: 'owner'
    };
    User.create(newUser, function (err, user) {
        if (err) return res.status(500).send(err);

        req.body.user = user._id;
        req.body.location = {
            type: "Point",
            coordinates: req.body.coordinates
        };

        Restaurant.create(req.body, function (err, restaurant) {
            if (err) return res.status(500).send(err);

            res.status(201).send(restaurant);
        });
    });
}

exports.update = function (req, res) {
    //http://localhost:5000/api/restaurants/234567890

    if (req.body._id) delete req.body._id;
    Restaurant.findOne({ _id: req.params.id }).exec(function (err, restaurant) {
        if (err) return res.status(500).send(err);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant Not Found! ' });

        let updated = _.merge(restaurant, req.body);
        updated.save(function (err) {
            if (err) return res.status(500).send(err);

            res.status(200).json({ massage: 'Restaurant Updated', restaurant: updated });
        });
    });
}

exports.destroy = function (req, res) {

    Restaurant.findOne({ _id: req.params.id }).exec(function (err, restaurant) {
        if (err) return res.status(500).send(err);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant Not Found! ' });

        restaurant.remove(function (err) {
            if (err) return res.status(500).send(err);

            res.status(200).json({ massage: 'Job Deleted!' });
        });
    });
}