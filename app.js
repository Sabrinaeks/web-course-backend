/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// Import All Dependencies
const dotenv = require('dotenv');
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

// Config ENV File
dotenv.config({path : './config.env'});
require('./db/conn');
const port = process.env.PORT;

// require model
const Users = require('./models/userSchema');

//these method is used to get data and cookies from frontend
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());

 
app.get('/', (req, res)=>{
    res.send('Hello World');
})

// Register 
app.post('/register', async (req, res)=>{
    try {
        //Get body or data
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        const createUser = new Users({
            username : username,
            email : email,
            password : password
        });
        // Save Mothod is Used to Create User or Insert User 
        // But Before Saving or Inserting, Password will hash 
        // because of hasing. after hash, it will save to db 
        
        const created = await createUser.save();
        console.log(created);
        res.status(200).send("Registered");
        
    } catch (error) {
        res.status(400).send(error)
    }
})

//Login User
app.post('/login', async (req, res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        // find user if exist
        const user = await Users.findOne({email : email});
        if(user){
            // verify password
            const isMatch = await bcryptjs.compare(password, user.password);

            if(isMatch){
                //Generate Token Which is Define is User Schema
                const token = await user.generateToken();
                res.cookie("jwt", token, {
                    // Expired Token in 24 Hours
                    expires : new Date(Date.now() + 86400000),
                    httpOnly : true
                })
                res.status(200).send("LoggedIn")
            }else{
                res.status(400).send("Invalid Credentials");
            }
        }else{
            res.status(400).send("Invalid Credentials");
        }
    } catch (error) {
        res.status(400).send(error);
    }
})

app.listen(port, ()=>{
    console.log('Backend is Listen')
})

//our backend is done and store data in databases
//now its time to connect front end with backend
