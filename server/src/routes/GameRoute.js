const express = require('express');
const router = express.Router();
const { join } = require('node:path');
const {verifyToken} = require('../middleware/authMiddleware');
const {checkNewbie} = require('../services/GameService');

router.get('/check-newbie',async (req,res)=>{
        const result = await checkNewbie('seophohoho');
        res.status(200).json(result);
    }
);

module.exports = router;