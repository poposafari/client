const {getUserInfoModel} = require('../models/GameModel');

async function getUserInfo(username){
    try{
        const result = await getUserInfoModel(username);
        return result;
    }
    catch(error){
        console.log(error);
    }
}

exports.getUserInfo = getUserInfo;