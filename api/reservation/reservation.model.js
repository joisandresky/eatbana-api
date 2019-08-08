const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
    code: { type: String, trim: true },
    bookDate: { type: Date },
    numberGuest: { type: Number, default: 1 },
    session: { type: String, enum: ["breakfast", "lunch", "dinner"] },
    timeSlot: { tyep: Date },
    guest: {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        guestDetail: { type: Schema.Types.ObjectId, ref: 'Guest' },
        phone: { type: String },
        specialEvent: [{ type: String, trim: true }],
        specialRequest: { type: String, trim: true }
    },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    status: { type: String, enum: ["new", "confirmed", "canceled", "rejected"] }
});

module.exports = mongoose.model('Reservation', ReservationSchema);