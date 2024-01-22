const {createAccountModel} = require('../repositories/AccountRepository');
const bcrypt = require('bcrypt');

// accountServices.js
async function createAccount(dto) {
    const hashedPassword = await setPasswordBycrypt(dto.password);
    return createAccountModel(dto.username, hashedPassword, dto.email, 0);
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

exports.createAccount = createAccount;