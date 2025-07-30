import { Request, Response } from 'express';
import IaSuggestion from '../Models/IaSuggestion.model';

export const getAllIaSuggestions = async (_req: Request, res: Response) => {
  const suggestions = await IaSuggestion.find().populate('tools_id').populate('attended_by');
  res.json(suggestions);
};

export const markIaSuggestionAsAttended = async (req: Request, res: Response) => {
  const suggestion = await IaSuggestion.findByIdAndUpdate(req.params.id, { attended: true }, { new: true });
  if (!suggestion) return res.status(404).json({ message: 'Suggestion not found' });
  res.json(suggestion);
};
