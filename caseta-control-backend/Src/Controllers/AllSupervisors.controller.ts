import { Request, Response } from 'express';
import Supervisor from '../Models/Supervisor.model';

// Get all supervisors (excluding passwords)
export const getAllSupervisors = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const supervisors = await Supervisor.find().select('-password'); // exclude password
    return res.status(200).json({ supervisors });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving supervisors', error });
  }
};
