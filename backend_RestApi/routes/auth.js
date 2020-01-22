const router = require('express').Router();
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {registerValidation, loginValidation} = require('../validation');


router.post('/register', async (req, res) => {

    //Valide edilecek User nesnesi:
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //Veri Tabanındaki kayıtlarda validasyon yapılacak. Aynı emailden başka varmı...
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send(req.body.email +': Bu e-posta zaten var'); 

    //TckimlikExist eklenecek..
    
    // Hash Passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);


    const user = new User({
        name: req.body.name,
        email: req.body.email,
        tcKimlikNo: req.body.tcKimlikNo,
        password: hashedPassword
    });
    try {
        const savedUser = await user.save();
        res.send({user: user._id});

    } catch (err) {
        res.status(400).send(err);
    }

});

//LOGIN
router.post('/login', async (req, res) => {

    //Valide edilecek User nesnesi:
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //Checking if the email exist
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send(req.body.email + ': Böyle bir email yok.');

    //PASSWORD IS CORRECT
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send('Şifre Hatalı.');

    //Token oluştur ve ata.
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);

});

module.exports = router;