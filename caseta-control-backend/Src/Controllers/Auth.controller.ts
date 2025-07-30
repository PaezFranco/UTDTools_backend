import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Student from '../Models/Student.model';
import Supervisor from '../Models/Supervisor.model';
import Session from '../Models/Session.model';

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('Missing JWT_SECRET or REFRESH_TOKEN_SECRET in environment variables.');
}

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;


// Función para generar tokens
const generateTokens = (userId: string, role: 'student' | 'supervisor') => {
  const accessToken = jwt.sign(
    { id: userId, role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  return { accessToken, refreshToken };
};

// ========== Register Student ==========
export const registerStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // file deepcode ignore HTTPSourceWithUncheckedType: <please specify a reason of ignoring this>
    const student_id = email.split('@')[0].split('_')[1];
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await Student.create({
      email,
      password: hashedPassword,
      student_id,
      is_profile_complete: false,
    });

    return res.status(201).json({ 
      message: 'Student registered', 
      student: newStudent 
    });
  } catch (err) {
    return res.status(500).json({ 
      message: 'Error registering student', 
      error: err 
    });
  }
};

// ========== Login Student ==========
export const loginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const ip_address = req.ip;
    const user_agent = req.get('User-Agent');

    const student = await Student.findOne({ email });
    
    if (!student || !student.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const studentIdStr = (student._id as unknown as string).toString();
    const { accessToken, refreshToken } = generateTokens(studentIdStr, 'student');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Session.create({
      user_id: studentIdStr,
      user_type: 'student',
      refresh_token: refreshToken,
      expires_at: expiresAt,
      ip_address,
      user_agent,
    });

    // file deepcode ignore WebCookieSecureDisabledExplicitly: <please specify a reason of ignoring this>
    res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,         // solo true en producción con HTTPS
    sameSite: 'lax',       // ✔️ permite cookies entre 5173 y 3000 en localhost
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

    return res.status(200).json({ 
      accessToken, 
      user: {
        id: student._id,
        email: student.email,
        student_id: student.student_id,
        role: 'student',
        is_profile_complete: student.is_profile_complete
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      message: 'Error logging in student', 
      error: err 
    });
  }
};

// ========== Login Supervisor ==========
export const loginSupervisor = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const ip_address = req.ip;
    const user_agent = req.get('User-Agent');

    const supervisor = await Supervisor.findOne({ email });
    
    if (!supervisor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, supervisor.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const supervisorIdStr = (supervisor._id as unknown as string).toString();
    const { accessToken, refreshToken } = generateTokens(supervisorIdStr, 'supervisor');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Session.create({
      user_id: supervisorIdStr,
      user_type: 'supervisor',
      refresh_token: refreshToken,
      expires_at: expiresAt,
      ip_address,
      user_agent,
    });

    res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: false,        // ✅ Solo usar true en producción con HTTPS
  sameSite: 'lax',      // ✅ Permite cookies entre puertos distintos (5173 vs 3000)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
});


    // return res.status(200).json({ 
    //   accessToken, 
    //   user: {
    //     id: supervisor._id,
    //     email: supervisor.email,
    //     name: supervisor.name,
    //     role: 'supervisor',
    //     is_active: supervisor.is_active
    //   }
    // });
  return res.status(200).json({ 
  accessToken, 
  supervisor: {
    id: supervisor._id,
    email: supervisor.email,
    name: supervisor.name,
    role: 'supervisor',
    is_active: supervisor.is_active
  }
});

  } catch (err) {
    return res.status(500).json({ 
      message: 'Error logging in supervisor', 
      error: err 
    });
  }
};

// ========== Refresh Token ==========
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    const session = await Session.findOne({
      refresh_token: refreshToken,
      is_active: true,
      expires_at: { $gt: new Date() }
    });

    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    session.last_used = new Date();
    await session.save();

    const newAccessToken = jwt.sign(
      { id: session.user_id, role: session.user_type },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    let user;
    if (session.user_type === 'student') {
      user = await Student.findById(session.user_id) as any;
    } else {
      user = await Supervisor.findById(session.user_id) as any;
    }

    return res.status(200).json({
      accessToken: newAccessToken,
      user: {
        id: user?._id,
        email: user?.email,
        role: session.user_type,
        ...(session.user_type === 'student' && {
          student_id: user?.student_id,
          is_profile_complete: user?.is_profile_complete
        }),
        ...(session.user_type === 'supervisor' && {
          name: user?.name,
          is_active: user?.is_active
        })
      }
    });
  } catch (err) {
  console.error('REFRESH TOKEN ERROR:', err); // 👈 agrega esto

  return res.status(500).json({ 
    message: 'Error refreshing token', 
    error: (err as Error).message || err 
  });
}

};

// ========== Logout ==========
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await Session.updateOne(
        { refresh_token: refreshToken },
        { is_active: false }
      );
    }

    res.clearCookie('refreshToken');

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ 
      message: 'Error logging out', 
      error: err 
    });
  }
};

// ========== Logout All Sessions ==========
export const logoutAllSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;

    await Session.updateMany(
      { user_id: userId, is_active: true },
      { is_active: false }
    );

    res.clearCookie('refreshToken');

    return res.status(200).json({ message: 'All sessions logged out successfully' });
  } catch (err) {
    return res.status(500).json({ 
      message: 'Error logging out all sessions', 
      error: err 
    });
  }
};
