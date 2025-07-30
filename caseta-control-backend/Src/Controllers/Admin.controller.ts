
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Supervisor from '../Models/Supervisor.model';
import Admin from '../Models/Admin.model';
import { generateToken } from '../Utils/Jwt';

// Register a new supervisor
export const registerSupervisor = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, assigned_location } = req.body;

    const existing = await Supervisor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Supervisor with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSupervisor = new Supervisor({
      name,
      email,
      password: hashedPassword,
      assigned_location,
    });

    await newSupervisor.save();
    return res.status(201).json({ message: 'Supervisor registered successfully', supervisor: newSupervisor });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering supervisor', error });
  }
};

// List all supervisors
export const getAllSupervisors = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const supervisors = await Supervisor.find().select('-password');
    return res.json(supervisors);
  } catch (error) {
    return res.status(500).json({ message: 'Error loading supervisors', error });
  }
};

// Activate or deactivate a supervisor
export const toggleSupervisorStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const supervisor = await Supervisor.findById(id);

    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    supervisor.is_active = !supervisor.is_active;
    await supervisor.save();

    return res.json({ message: `Supervisor ${supervisor.is_active ? 'activated' : 'deactivated'}`, supervisor });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating supervisor status', error });
  }
};

// Admin login
export const loginAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: admin._id, role: 'admin' });

    return res.json({ message: 'Login successful', token, admin });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in admin', error });
  }
};
