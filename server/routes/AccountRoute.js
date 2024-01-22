const express = require('express');
const router = express.Router();
const { join } = require('node:path');
const {createAccount} = require('../services/AccountService');

router.get('/signup',(req,res)=>{
    res.sendFile(join(__dirname, '../static/signup.html'));
});

router.post('/signup', async (req, res) => {
    const dto = req.body;
    createAccount(dto)
    .then((result) => {
      res.status(200).json({ message: 'Account created successfully', result });
    })
    .catch((error) => {
      res.status(409).json({ error: error.message });
    });
});

module.exports = router;