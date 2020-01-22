const joi = require('@hapi/joi');

//Register Validation
const registerValidation = data => {

    const UserShema = joi.object({
        name: joi.string()
            .min(6)
            .required(),
        email: joi.string()
            .min(6)
            .required()
            .email(),
        tcKimlikNo: joi.string()
            .min(11)
            .max(11)
            .required(),
        password: joi.string()
            .min(6)
            .required()
    });
    
return UserShema.validate(data);

};

//Login Validation
const loginValidation = data => {

    const Shema = joi.object({
        email: joi.string()
            .min(6)
            .required()
            .email(),
        password: joi.string()
            .min(6)
            .required()
    });
    
return Shema.validate(data);

};

//Yeni hesap oluşturma validasyon
const newAccountValidation = data => {

    const Shema = joi.object({
        hesapNo: joi.string()
            .min(6)
            .required(),
        hesapAdi: joi.string()
            .required(),
        hesapAciklamasi: joi.string()
            .min(6)
            .required()
    });
    
return Shema.validate(data);

};

module.exports.registerValidation = registerValidation;

module.exports.loginValidation = loginValidation;

module.exports.newAccountValidation = newAccountValidation;