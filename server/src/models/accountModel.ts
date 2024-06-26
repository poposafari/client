import dbPool from "../config/db";

export interface User{
    username:string;
    password:string;
    email:string;
}

export const createAccount = async(user:User)=>{
    const con = await dbPool.getConnection();
    try{
        const res = await con.query(
            'INSERT INTO tAccount (username,password,email,isGameAccount) VALUES (?,?,?,?)',
            [user.username,user.password,user.email,0]
        );
        return res;
    } catch(e:any){
        if(e.code === 'ER_DUP_ENTRY'){
            throw new Error('Duplicate entry for unique key');
        }
    } finally{
        con.release();
    }
}

export const getUserByUsername = async(username:string)=>{
    const con = await dbPool.getConnection();
    try {
        const res = await con.query(
            'SELECT * FROM tAccount WHERE username = ?',
            [username]
        );
        return res[0];
    } catch(e){
        console.error(e);
    } finally{
        con.release();
    }
}