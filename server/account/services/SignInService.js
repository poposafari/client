const {getAccountModel} = require('../models/SignInModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signIn(dto) {
    try {
      const result = await getAccountDataModel(dto.username);
      await validUserData(result[0].password, dto.password);
      const token = jwt.sign({ username: dto.username }, process.env.SECRET_KEY, { expiresIn: '5h' });
      return {success:true,token};
    } catch (error) {
      return {success:false,error:error.message};
    }
}
  
async function validUserData(hashedPassword, plainPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, hashedPassword)
        .then(res => {
            if (res) {
                resolve();
            } 
            else {
                reject(new Error('Invalid'));
            }
        })
        .catch(err => {
            reject(err);
        });
    });
}

exports.signIn = signIn;