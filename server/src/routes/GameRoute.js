const express = require('express');
const router = express.Router();
const { join } = require('node:path');
const {verifyToken} = require('../middleware/authMiddleware');
const {getUserInfo} = require('../services/GameService');

router.get('/user-info',verifyToken,async (req,res)=>{
    const result = await getUserInfo(req.result.userId);
    res.status(200).json(result);
});

module.exports = router;