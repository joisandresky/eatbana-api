const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
    code: { type: String, trim: true },
    name: { type: String, trim: true, required: true },
    cuisines: [{ type: String, trim: true }],
    estabilishment: { type: String, trim: true },
    phone: { type: String, trim: true },
    openingHours: [{
        day: { type: String, trim: true },
        startHours: { type: Date },
        endHours: { type: Date }
    }],
    address: { type: String, required: true, trim: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: [{ type: Number, required: true }]
    },
    // coordinates: [{ type: Number }],
    facilities: [{
        value: { type: String },
        name: { type: String },
        point: { type: Number },
        selected: { type: Boolean }
    }],
    menuImage: [{ type: String, trim: true }],
    reviews: [{
        customer: { type: Schema.Types.ObjectId, ref: 'Guest' },
        rating: { type: Number, default: 5 },
        comments: { type: String, trim: true }
    }],
    photos: [{ type: String, trim: true }],
    bookAvailable: { type: Boolean, default: false },
    bookTimeSlot: [{ type: Date }],
    capacity: { type: Number, default: 0 },
    profileCompleted: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

RestaurantSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('Restaurant', RestaurantSchema);