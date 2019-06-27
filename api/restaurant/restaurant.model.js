const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
    code: { type: String, trim: true },
    cuisines: [{ type: String, trim: true }],
    estabilishment: { type: String, trim: true },
    phone: { type: String, trim: true },
    openingHours: [{
        day: { type: String, trim: true },
        startHours: { type: Number },
        endHours: { type: Number }
    }],
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        coordinates: [{ type: Number }]
    },
    facilities: [{ type: String, trim: true }],
    menuImage: [{ type: String, trim: true }],
    reviews: [{
        customer: { type: Schema.Types.ObjectId, ref: 'Guest' },
        rating: { type: Number, default: 5 },
        comments: { type: String, trim: true }
    }],
    photos: [{ type: String, trim: true }],
    bookAvailable: { type: Boolean, default: false },
    bookTimeSlot: [{ type: Date }],
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);