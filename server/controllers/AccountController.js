const {signUp} = require('../services/AccountService');

function signUpController(dto){
    signUp(dto.email,dto.nickname,dto.password,dto.type);
    
}

exports.signUpController = signUpController;