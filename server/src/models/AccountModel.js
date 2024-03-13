const database = require('../../config/database');

function createAccountModel(username, password, email, gender) {
    console.log(username);
    return new Promise((resolve, reject) => {
      const values = [username, password, email, gender];
      const sql = `
        INSERT INTO account
        (username, password, email, gender)
        VALUES (?, ?, ?, ?)
      `;
  
      database.query(sql, values, (error, results) => {
        if (error) {
          console.log(error);
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
      FROM account
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