const _ = require('lodash');
const Q = require('q');
const User = require('./user.model');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Restaurant = require("../restaurant/restaurant.model");

process.env.SECRET_KEY = 'secret'

//membuat function
exports.index = function (req, res) {
    // http://localhost:5000/api/users?page=1&limit=10
    let page = Number(req.query.page) || 1,
        limit = Number(req.query.limit) || 10,
        skip = (page - 1) * limit;

    //proses async
    Q.all([
        User.count(), //total data
        User.find().skip(skip).limit(limit) //jumlah data
    ])
        .spread(function (total, users) {
            res.status(200).json({
                total,
                users
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.search = function (req, res) {
    //http://localhost:5000/api/jobs/search?value=xdfgchgvjh
    User.find({
        name: {
            $regex: req.query.value,
            $options: 'i'
        }
    }).exec(function (err, users) {
        if (err) return res.status(500).send(err);

        res.status(200).json(users);
    });
};

exports.show = function (req, res) {
    //http://localhost:5000/api/users/234567890
    User.findOne({
        _id: req.params.id
    }).exec(function (err, user) {
        if (err) return res.status(500).send(err);
        if (!user) return res.status(404).json({
            message: 'User Not Found! '
        });

        res.status(200).json(user);
    });
};

exports.create = function (req, res) {
    User.create(req.body, function (err, user) {
        if (err) return res.status(500).send(err);

        res.status(201).send(user);
    });
}

exports.seed = function (req, res) {
    // Seed Doctor
    let newUser = {
        email: 'admin@admin.com',
        password: 'admin123',
        role: 'administrator'
    };
    User.count({ role: 'administrator' }).exec(function (err, c) {
        if (err) return res.status(500).send(err);

        if (c > 0) return res.status(400).json({ message: 'User Admin Already Seeded!' });

        User.create(newUser, function (err, user) {
            if (err) return res.status(500).send(err);

            return res.status(201).json({ message: "User Admin Seeded!" });
        });
    });
}

exports.update = function (req, res) {
    //http://localhost:5000/api/users/234567890

    if (req.body._id) delete req.body._id;
    User.findOne({
        _id: req.params.id
    }).exec(function (err, user) {
        if (err) return res.status(500).send(err);
        if (!user) return res.status(404).json({
            message: 'User Not Found! '
        });

        let updated = _.merge(user, req.body);
        updated.save(function (err) {
            if (err) return res.status(500).send(err);

            res.status(200).json({
                massage: 'User Updated',
                user: updated
            });
        });
    });
}

exports.destroy = function (req, res) {

    User.findOne({
        _id: req.params.id
    }).exec(function (err, user) {
        if (err) return res.status(500).send(err);
        if (!user) return res.status(404).json({
            message: 'User Not Found! '
        });

        user.remove(function (err) {
            if (err) return res.status(500).send(err);

            res.status(200).json({
                massage: 'Job Deleted!'
            });
        });
    });
}

exports.login = function (req, res) {
    User.findOne({
        email: req.body.email
    })
        .then(user => {
            if (user) {
                // if (bcrypt.compareSync(req.body.password, user.password)) {
                if (req.body.password === user.password) {
                    const payload = {
                        _id: user._id,
                        email: user.email,
                        role: user.role
                    }
                    let token = jwt.sign(payload, process.env.SECRET_KEY, {
                        expiresIn: 1440
                    });
                    switch (user.role) {
                        case 'admin':
                            return res.send({
                                token: token,
                                user: payload
                            });
                            break;
                        case 'owner':
                            Restaurant.findOne({ user: user._id }).exec(function (err, restaurant) {
                                if (err) return res.status(500).send(err);

                                if (!restaurant) return res.status(400).json({ message: "Restaurant Data Not Found!" });
                                payload.restaurant = restaurant;
                                return res.send({
                                    token: token,
                                    user: payload
                                });
                            });
                            break;
                        default:
                            res.send({
                                token: token,
                                user: payload
                            });
                    }
                } else {
                    res.json({
                        error: 'Password is invalid'
                    })
                }
            } else {
                res.json({
                    error: 'User does not exist'
                })
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })
}