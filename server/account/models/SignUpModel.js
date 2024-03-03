const database = require('../../config/database');

function signUpModel(username, password, email, gender) {
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

exports.signUpModel = signUpModel;