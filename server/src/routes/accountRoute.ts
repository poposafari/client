import {Router} from 'express';
import { orderCreateAccount } from '../controllers/accountController';

const router = Router();

router.post('/register',orderCreateAccount);

export default router;