import {Router} from 'express';
import { orderCreateAccount, orderLogin } from '../controllers/accountController';

const router = Router();

router.post('/register',orderCreateAccount);
router.post('/login',orderLogin);

export default router;