const mongoose = require('mongoose');

const accountInfoSchema = new mongoose.Schema({
    hesapSahibiTc: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    hesapNo: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    hesapAdi: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    hesapAciklamasi: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    hesapBakiyesi: {
        type: Number,
        default: 0,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('accountInfo', accountInfoSchema);