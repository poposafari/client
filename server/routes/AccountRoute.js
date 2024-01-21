const express = require('express');
const router = express.Router();
const { join } = require('node:path');
const {signUpController} = require('../controllers/AccountController');

router.get('/signup',(req,res)=>{
    console.log(__dirname);
    res.sendFile(join(__dirname, '../static/signup.html'));
});

router.post('/signup',(req,res)=>{
    const signupDto = req.body;
    const result = signUpController(signupDto);
    return result;
});

module.exports = router;