import { Router } from 'express';
import { getAllIaSuggestions, markIaSuggestionAsAttended } from '../Controllers/IaSuggestion.controller';

const iaSuggestionRouter = Router();

iaSuggestionRouter.get('/', getAllIaSuggestions);
iaSuggestionRouter.put('/:id/attend', markIaSuggestionAsAttended);

export default iaSuggestionRouter;
