const mongoose = require('mongoose');

const userShema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    tcKimlikNo: {
        type: String,
        required: true,
        min: 11,
        max: 11
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userShema);