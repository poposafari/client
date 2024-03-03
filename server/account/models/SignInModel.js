function getAccountModel(username) {
  return new Promise((resolve, reject) => {
    const values = [username];
    const sql = `
        SELECT username, password
        FROM account
        WHERE username = (?)
        `;
    database.query(sql, values, (error, results) => {
      if (results.length > 0) {
        resolve(results);
      } else {
        reject({ message: "not user" });
      }
    });
  });
}

exports.getAccountModel = getAccountModel;