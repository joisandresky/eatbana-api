const _ = require('lodash');
const Q = require('q');
const Restaurant = require('./restaurant.model');
const User = require('../user/user.model');
let totalPembagi = 0;

//membuat function
exports.index = function (req, res) {
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

exports.nearby = function (req, res) {
    if (!req.query.lng && !req.query.lat) {
        return res.status(500).json({ message: "Latitude and Longitude is Required!" });
    }
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 25;
    let skip = (page - 1) * limit;
    let search = req.query.search ? req.query.search : '';

    Q.all([
        Restaurant.find({
            name: { $regex: search, $options: 'i' },
            // estabilishment: { $regex: search, $options: 'i' },
            location: {
                $near: {
                    $maxDistance: 5000,
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(req.query.lng), Number(req.query.lat)]
                    },
                }
            }
        }).skip(skip).limit(limit).exec(),
        Restaurant.count({
            name: { $regex: search, $options: 'i' },
            // estabilishment: { $regex: search, $options: 'i' },
            location: {
                $near: {
                    $maxDistance: 5000,
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(req.query.lng), Number(req.query.lat)]
                    },
                }
            }
        }).skip(skip).limit(limit).exec()
    ]).spread(function (restaurants, total) {
        res.status(200).json({ restaurant: restaurants, total: total });
    })
        .catch(function (err) {
            if (err) return res.status(500).send(err);
        });
}

exports.findWithFormula = function (req, res) {
    if (!req.query.lng && !req.query.lat) {
        return res.status(500).json({ message: "Latitude and Longitude is Required!" });
    }
    let promisesFacilities = [];

    let query = queryBuilder(req.body);
    let distance = req.body.distance ? distanceQuery(req.body.distance) : 5000;
    console.log('query', query, distance);

    Restaurant.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [Number(req.query.lng), Number(req.query.lat)] },
                distanceField: "dist.calculated",
                maxDistance: distance,
                includeLocs: "dist.location",
                spherical: true
            }
        },
        query,
        { $limit: 10 },
    ]).exec(function (err, restaurants) {
        if (err) return res.status(500).send(err);
        restaurants.map(function (rest) {
            promisesFacilities.push(countFacilitiesPoint(rest));
        });

        Q.all(promisesFacilities)
            .spread(function () {
                let promisesFormula = [];
                restaurants.map(function (restar) {
                    promisesFormula.push(countWeightedProductFirst(restar));
                });
                Q.all(promisesFormula)
                    .spread(function (result) {
                        let promisesFormulaEnd = [];
                        restaurants.map(function (restar) {
                            promisesFormulaEnd.push(countWeightedProductEnd(restar));
                        });
                        Q.all(promisesFormulaEnd)
                            .spread(function (results) {
                                restaurants.sort(function (a, b) {
                                    return a.resultEnd - b.resultEnd;
                                });
                                res.status(200).json(restaurants);
                            }).catch(function (err) {
                                if (err) return res.status(500).send(err);
                            });
                    }).catch(function (err) {
                        if (err) return res.status(500).send(err);
                    })
            })
            .catch(function (err) {
                if (err) return res.status(500).send(err);
            });
    });
};

function countWeightedProductFirst(restaurant) {
    return new Promise(function (resolve, reject) {
        let result = (Math.pow(restaurant.dist.calculated, 0.26)) * (Math.pow(restaurant.avgCost, 0.17)) * (Math.pow(restaurant.capacity, 0.22)) * (Math.pow(50, 0.22));
        restaurant.resultFirst = result;
        totalPembagi += result;
        resolve(restaurant);
    });
}

function countWeightedProductEnd(restaurant) {
    return new Promise(function (resolve, reject) {
        restaurant.resultEnd = restaurant.resultFirst / totalPembagi;
        resolve(restaurant);
    });
}

function countFacilitiesPoint(restaurant) {
    return new Promise(function (resolve, reject) {
        let total = 0;
        restaurant.facilities.filter(function (fa) {
            return fa.selected;
        }).map(function (fc) {
            console.log('fc after filter selected', fc);
            total += fc.point;
        });

        restaurant.pointFacilities = total;

        resolve(restaurant);
    });
};

function queryBuilder(body) {
    let price = priceQuery(body.price);
    let capacity = capacityQuery(body.capacity);

    return { $match: { avgCost: price, capacity: capacity } };
}

function priceQuery(price) {
    if (!price) return { $gte: 20000 };

    switch (price.value) {
        case "price_under_10":
            return { $lte: 10000 };
        case "price_10_to_20":
            return { $gte: 10000, $lte: 20000 };
        default:
            return { $gte: 20000 };
    }
}

function distanceQuery(distance) {
    if (!distance) return 5000;
    switch (distance.value) {
        case "distance_under_1km":
            return 1000;
        case "distance_1_to_2km":
            return 2000;
        default:
            return 5000;
    }
}

function facilitiesQuery(facility) {

}

function capacityQuery(capacity) {
    if (!capacity) return { $gte: 300 };

    switch (capacity.value) {
        case "capacity_under_100":
            return { $lte: 100 };
        case "capacity_100_to_300":
            return { $gte: 100, $lte: 300 };
        default:
            return { $gte: 300 };
    }
}

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
            coordinates: req.body.coordinates.reverse()
        };
        req.body.estabilishment = req.body.establishment;
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