const jwt = require('jsonwebtoken');
require("dotenv").config();
exports.generateToken = (payload,expires)=>{
    return jwt.sign(payload,process.env.TOKEN_SECRET,{
        expiresIn: expires,
    })
}