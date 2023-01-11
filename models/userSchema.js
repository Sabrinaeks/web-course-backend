/* eslint-disable no-undef */
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// user schema or document structure
const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true
    },
    tokens : [
        {
            token : {
                type : String,
                required : true
            }
        }
    ]
})

// hashing Password to secure
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = bcryptjs.hashSync(this.password, 10);
    }
    next();
})

// generate tokens to verify user
userSchema.method.generateToken = async function(){
    try {
        let generateToken = jwt.sign(({_id : this._id}, process.env.SECRET_KEY));
        this.tokens = this.tokens.concat({token : generateToken});
        await this.save();
        return generateToken
    } catch (error) {
        console.log(error)
    }
}

// create model
const Users = new mongoose.model("USER", userSchema);

module.exports = Users;