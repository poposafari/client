const {createAccountModel, getAccountDataModel} = require('../models/AccountModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require("dotenv").config();

async function createAccount(dto) {
    const hashedPassword = await setPasswordBycrypt(dto.password);
    return createAccountModel(dto.username, hashedPassword, dto.email, 1);
}

async function setPasswordBycrypt(password) {
    const saltRounds = 10;
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashPassword = await bcrypt.hash(password, salt);
        return hashPassword;
    } catch (err) {
        console.error(err.message);
    }
}

async function signIn(dto) {
    try {
      const result = await getAccountDataModel(dto.username);
      await validUserData(result[0].password, dto.password);
      const token = jwt.sign({ username: dto.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
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
  

exports.createAccount = createAccount;
exports.signIn = signIn;