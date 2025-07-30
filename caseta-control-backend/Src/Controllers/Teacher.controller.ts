import { Request, Response } from 'express';
import Teacher from '../Models/Teacher.model';

export const getAllTeachers = async (_req: Request, res: Response) => {
  try {
    const teachers = await Teacher.find({ active: true }).sort({ full_name: 1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error });
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher', error });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const newTeacher = new Teacher(req.body);
    await newTeacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      res.status(400).json({ message: 'Teacher ID or email already exists' });
    } else {
      res.status(500).json({ message: 'Error creating teacher', error });
    }
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTeacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ message: 'Error updating teacher', error });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    // Soft delete - marcar como inactivo
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher', error });
  }
};