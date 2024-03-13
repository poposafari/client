const express = require('express');
const router = express.Router();
const { join } = require('node:path');
const {verifyToken} = require('../../middleware/authMiddleware');
const {getUserInfo,getSeason} = require('../services/GameService');

router.get('/user-info',verifyToken,async (req,res)=>{
    let result = await getUserInfo(req.result.userId);
    console.log(result);
    result[0].season = getSeason();
    res.status(200).json(result);
});

module.exports = router;