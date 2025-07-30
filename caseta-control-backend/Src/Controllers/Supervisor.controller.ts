import { Request, Response } from 'express';
import Supervisor from '../Models/Supervisor.model';

export const getAllSupervisors = async (_req: Request, res: Response) => {
  const supervisors = await Supervisor.find();
  res.json(supervisors);
};

export const getSupervisorById = async (req: Request, res: Response) => {
  const supervisor = await Supervisor.findById(req.params.id);
  if (!supervisor) return res.status(404).json({ message: 'Supervisor not found' });
  res.json(supervisor);
};

export const updateSupervisor = async (req: Request, res: Response) => {
  const supervisor = await Supervisor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!supervisor) return res.status(404).json({ message: 'Supervisor not found' });
  res.json(supervisor);
};
