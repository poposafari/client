const {signUpRepository} = require('../repositories/AccountRepository');

function signUp(email,nickname,password,type){
    type = Number(type.substr(2,3));
    signUpRepository(email,nickname,password,type);
}

exports.signUp = signUp;