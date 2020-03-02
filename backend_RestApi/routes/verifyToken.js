const jws = require('jsonwebtoken');

module.exports = function(req, res, next){

    const token = req.header('auth-token');
    if(!token) return res.status(401).send('Erişim reddedildi.');

    try {
        const verifyed = jws.verify(token, process.env.TOKEN_SECRET);
        req.user = verifyed;
        next();
    } catch (err) {
        res.status(400).send('Geçersiz token.');
    }

}