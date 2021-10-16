const fs = require ('fs');
const path = require ('path');
const User = require ('mongoose').model ('User');

const pathToKey = path.join (__dirname, '..', 'id_rsa_pub.pem');
const secret = 'secret';

const JwtStrategy = require ('passport-jwt').Strategy;
const ExtractJWT = require ('passport-jwt').ExtractJwt;
// TODO
const options = {
    jwtFromRequest: ExtractJWT.fromBodyField('token'), 
    secretOrkey: secret,
    
};

const strategy = new JwtStrategy(options, (payload, done)=>{

})

// TODO
module.exports = passport => {
    passport.use(strategy)
};
