import axios from "axios"

const baseURL = `http://localhost:9000`;

export const Axios= axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  }
});

export async function apiPost(url:string,data:any){
    try{
        const res = await Axios.post(url,data);
        return res.data;
    }catch(error){
        console.log('Request Error : ',error);
        throw error;
    }
}