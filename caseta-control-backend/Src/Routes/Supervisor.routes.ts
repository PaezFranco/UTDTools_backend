
import { Router } from 'express';
import { getAllSupervisors, getSupervisorById, updateSupervisor } from '../Controllers/Supervisor.controller';

const supervisorRouter = Router();

supervisorRouter.get('/', getAllSupervisors);
supervisorRouter.get('/:id', getSupervisorById);
supervisorRouter.put('/:id', updateSupervisor);

export default supervisorRouter;
