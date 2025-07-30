import { Request, Response } from 'express';
import Student from '../Models/Student.model';
import bcrypt from 'bcrypt';

export const registerFromMobile = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validar correo institucional
    const emailRegex = /^([a-zA-Z]+)_([0-9]{10})@utd\.edu\.mx$/;
    // file deepcode ignore HTTPSourceWithUncheckedType: <please specify a reason of ignoring this>
    const match = email.match(emailRegex);

    if (!match) {
      return res.status(400).json({
        message: 'Email inválido. Usa formato: nombre_matricula10digitos@utd.edu.mx'
      });
    }

    const full_name = capitalize(match[1]);
    const student_id = match[2];

    // Verificar duplicado
    const exists = await Student.findOne({ $or: [{ email }, { student_id }] });
    if (exists) {
      return res.status(400).json({ message: 'Ya existe un estudiante con ese correo o matrícula' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      student_id,
      email,
      password: hashedPassword,
      full_name,
      is_profile_complete: false,
      registered_fingerprint: false,
      blocked: false
    });

    const saved = await newStudent.save();
    const { password: _, ...studentResponse } = saved.toObject();
    res.status(201).json(studentResponse);

  } catch (error) {
    res.status(500).json({ message: 'Error al registrar desde app móvil', error });
  }
};

const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
