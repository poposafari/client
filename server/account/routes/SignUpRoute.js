const express = require('express');
const router = express.Router();
const { join } = require('node:path');
const {signUp} = require('../services/SignUpService');

router.get('/',(req,res)=>{
    res.sendFile(join(__dirname, '../../view/signup.html'));
});

router.post('/',(req,res)=>{
    const dto = req.body;
    signUp(dto)
    .then(() => {
        res.status(200).json({ success: 'create account' });
    })
    .catch((error) => {
      res.status(409).json({ error: error.message });
    });
});

module.exports = router;