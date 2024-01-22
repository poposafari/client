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

function checkExistingAccountModel(username){
    const values = [username];
    const sql = 'select username from user_account where id = (?)';
    database.query(sql,values,(err,result)=>{
        if(result.length > 0) {console.log('이미 존재하는 아이디입니다.')}
        if(err) console.log(err);
    });
}

exports.createAccountModel = createAccountModel;
exports.checkExistingAccountModel = checkExistingAccountModel;