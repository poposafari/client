import {Request,Response} from 'express';
import { getUserByUsername } from "../models/accountModel";
import { comparePassword, createAccountService } from "../services/accountService";

export const orderCreateAccount = async(req:Request,res:Response) =>{
    try{
        const userInfo = await getUserByUsername(req.body.username);
        if(userInfo){
            return res.status(400).json({message:'Username already exists'});
        }
        const user = await createAccountService(req.body);
        return res.status(200).json({message:'Success create account'});
    } catch(error:any){
        if (error.message === 'Duplicate entry for unique key') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({message:'Unexpected Error'});
    }
}

export const orderLogin = async(req:Request,res:Response)=>{
    try{
        const userInfo = await getUserByUsername(req.body.username);
        if(userInfo){
            const result = await comparePassword(req.body.password,userInfo.password);
            if(result){
                return res.status(200).json({message:'Success Login',data:userInfo.isGameAccount});
            }else{
                return res.status(400).json({message:'Invalid username or password'});
            }
        }else{
            return res.status(400).json({message:'Invalid username or password'});
        }
    } catch(error:any){
        return res.status(500).json({message:'Unexpected Error'});
    }
}