import app from './app';
import { API_PORT } from './config/constants';

app.listen(API_PORT,()=>{
    console.log(`PoPoSeop API Server is running on port ${API_PORT}`);
});