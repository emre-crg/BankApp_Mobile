const mongoose = require('mongoose');

const accountLogSchema = new mongoose.Schema({
    hesapNo: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    islemTürü: {
        type: String,
        required: true,
        min: 6,
        max: 255,
        default: 'Yeni Hesap Oluşturma.'
    },
    islemBilgileri: {
        type: String,
        required: true,
        max: 1024,
        min: 6,
        default: 'Yeni Hesap Oluşturuldu.'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('accountLog', accountLogSchema);