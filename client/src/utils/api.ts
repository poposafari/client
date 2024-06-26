import axios from "axios";

const api = axios.create({
    baseURL: process.env.API_SERVER
});

console.log(process.env.API_SERVER);

export default api;