const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const JwtStrategy = require ('passport-jwt').Strategy;
const ExtractJWT = require ('passport-jwt').ExtractJwt;

const initialize = (passport)=>{
    
}


const secret = 'secret';
const verifyCallback = (username, password, done)=>{

}
// TODO
