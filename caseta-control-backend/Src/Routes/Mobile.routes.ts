import { Router } from 'express';
import { registerFromMobile } from '../Controllers/Mobile.controller';

const mobileRouter = Router();

mobileRouter.post('/register', registerFromMobile); // POST /api/mobile/register

export default mobileRouter;
