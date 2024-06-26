import { User, createAccount, getUserByUsername } from "../models/accountModel";
import crypto from 'crypto';

const setCryptoPassword = (password:string)=>{
    return crypto.createHash('sha256').update(password).digest('hex');
}

export const getUserService = async(username:string)=>{
    return await getUserByUsername(username);
}

export const createAccountService = async(data:any)=>{
    const user:User={
        username:data.username,
        password:setCryptoPassword(data.password),
        email:data.email
    }
    return await createAccount(user);
}