const express = require('express');
const router = express.Router();
const { join } = require('node:path');
const {createAccount, signIn} = require('../services/AccountService');

router.get('/signup',(req,res)=>{
    res.sendFile(join(__dirname, '../static/signup.html'));
});

router.get('/signin',(req,res)=>{
    res.sendFile(join(__dirname,'../static/signin.html'));
});

router.get('/signup-success',(req,res)=>{
    res.sendFile(join(__dirname, '../static/signup-success.html'));
});

router.post('/signup', async (req, res) => {
    const dto = req.body;
    createAccount(dto)
    .then(() => {
        res.status(200).json({ success: 'create account' });
    })
    .catch((error) => {
      res.status(409).json({ error: error.message });
    });
});

router.post('/signin', async (req, res) => {
    const dto = req.body;
    try {
        const result = await signIn(dto);
        if (result.success) {
            res.status(200).cookie('Authorization',result.token,{httpOnly:true}).send();
        } else {
            res.status(404).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;