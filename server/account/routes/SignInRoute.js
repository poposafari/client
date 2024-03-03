const express = require('express');
const router = express.Router();
const { join } = require('node:path');
const {signIn} = require('../services/SignInService');

router.get('/',(req,res)=>{
    res.sendFile(join(__dirname,'../../view/signin.html'));
});

router.post('/', async (req, res) => {
    const dto = req.body;
    try {
        const result = await signIn(dto);
        if (result.success) {
            res.cookie('Authorization',result.token,{httpOnly:true}).send();
        } else {
            res.status(404).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;