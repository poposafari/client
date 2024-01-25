const database = require('../config/database');

function checkNewbieModel(username){
    const values = [username];
    const sql = `
      SELECT is_game_account
      FROM user_account
      WHERE username=(?)
    `;
    return new Promise((resolve, reject) => {
        database.query(sql, values, (error, results) => {
            if(error){
                reject(error);
            } 
            else{
                resolve(results);
            }
        });
    });
}

exports.checkNewbieModel = checkNewbieModel;