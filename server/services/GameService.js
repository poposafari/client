const {checkNewbieModel} = require('../models/GameModel');

async function checkNewbie(username){
    try{
        const result = await checkNewbieModel(username);
        return result;
    }
    catch{
        console.error(err.message);
    }
}

exports.checkNewbie = checkNewbie;