const {getUserInfoModel} = require('../models/GameModel');

async function getUserInfo(username){
    try{
        return await getUserInfoModel(username);
    }
    catch(error){
        console.log(error);
    }
}

function getSeason(){
    const date = new Date();
    const currentMonth = date.getMonth();
    if(currentMonth >= 1 && currentMonth <= 3){return 0;}
    if(currentMonth >= 4 && currentMonth <= 6){return 1;}
    if(currentMonth >= 7 && currentMonth <= 9){return 2;}
    else{return 3;}
}

exports.getUserInfo = getUserInfo;
exports.getSeason = getSeason;