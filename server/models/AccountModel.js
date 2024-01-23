const database = require('../config/database');

function createAccountModel(username, password, email, is_game_account) {
    return new Promise((resolve, reject) => {
      const values = [username, password, email, is_game_account];
      const sql = `
        INSERT INTO user_account
        (username, password, email, is_game_account)
        VALUES (?, ?, ?, ?)
      `;
  
      database.query(sql, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
}

function getAccountDataModel(username){
  return new Promise((resolve, reject) => {
    const values = [username];
    const sql = `
      SELECT username, password
      FROM user_account
      WHERE username = (?)
    `;
    database.query(sql, values, (error, results) => {
      if(results.length > 0){
        resolve(results);
      }
      else{
        reject({message:'not user'});
      }
    });
  });
}

exports.createAccountModel = createAccountModel;
exports.getAccountDataModel = getAccountDataModel;