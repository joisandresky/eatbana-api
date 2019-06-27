const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuestSchema = new Schema({
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female"] },
    pob: { type: String, trim: true },
    dob: { type: Date },
    location: { type: String, trim: true },
    dineline: [{
        restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
        visitDate: { type: Date }
    }],
    socialAccount: {
        instagram: { type: String, trim: true },
        facebook: { type: String, trim: true },
        twitter: { type: String, trim: true }
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Guest', GuestSchema);