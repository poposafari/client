const {signUpModel} = require('../models/SignUpModel');
const bcrypt = require('bcrypt');

async function signUp(dto) {
    const hashedPassword = await setPasswordBycrypt(dto.password);
    return signUpModel(dto.username, hashedPassword, dto.email, 1);
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

exports.signUp = signUp;