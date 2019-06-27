const _ = require('lodash');
const Q = require('q');
const Reservation = require('./reservation.model');

//membuat function
exports.index = function (req, res) {
    // http://localhost:5000/api/reservations?page=1&limit=10
    let page = Number(req.query.page) || 1,
        limit = Number(req.query.limit) || 10,
        skip = (page - 1) * limit;

    //proses async
    Q.all([
        Reservation.count(), //total data
        Reservation.find().skip(skip).limit(limit) //jumlah data
    ])
        .spread(function (total, reservations) {
            res.status(200).json({ total, reservations });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.search = function (req, res) {
    //http://localhost:5000/api/jobs/search?value=xdfgchgvjh
    Reservation.find({ name: { $regex: req.query.value, $options: 'i' } }).exec(function (err, reservations) {
        if (err) return res.status(500).send(err);

        res.status(200).json(reservations);
    });
};

exports.show = function (req, res) {
    //http://localhost:5000/api/reservations/234567890
    Reservation.findOne({ _id: req.params.id }).exec(function (err, reservation) {
        if (err) return res.status(500).send(err);
        if (!reservation) return res.status(404).json({ message: 'Reservation Not Found! ' });

        res.status(200).json(reservation);
    });
};

exports.create = function (req, res) {
    Reservation.create(req.body, function (err, reservation) {
        if (err) return res.status(500).send(err);

        res.status(201).send(reservation);
    });
}

exports.update = function (req, res) {
    //http://localhost:5000/api/reservations/234567890

    if (req.body._id) delete req.body._id;
    Reservation.findOne({ _id: req.params.id }).exec(function (err, reservation) {
        if (err) return res.status(500).send(err);
        if (!reservation) return res.status(404).json({ message: 'Reservation Not Found! ' });

        let updated = _.merge(reservation, req.body);
        updated.save(function (err) {
            if (err) return res.status(500).send(err);

            res.status(200).json({ massage: 'Reservation Updated', reservation: updated });
        });
    });
}

exports.destroy = function (req, res) {

    Reservation.findOne({ _id: req.params.id }).exec(function (err, reservation) {
        if (err) return res.status(500).send(err);
        if (!reservation) return res.status(404).json({ message: 'Reservation Not Found! ' });

        reservation.remove(function (err) {
            if (err) return res.status(500).send(err);

            res.status(200).json({ massage: 'Job Deleted!' });
        });
    });
}