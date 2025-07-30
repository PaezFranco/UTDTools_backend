import { Router, Request, Response } from 'express';
import { Fingerprint } from '../Models/fingerprint.model';
import Student from '../Models/Student.model'; // Importación correcta

const router = Router();

// Ruta para registrar huella desde ESP32
router.post('/register-esp32', async (req: Request, res: Response) => {
  try {
    const { student_id, fingerprint_id } = req.body;

    if (!student_id || !fingerprint_id) {
      return res.status(400).json({ success: false, message: 'Faltan datos necesarios' });
    }

    let fingerprint = await Fingerprint.findOne({ student_id });

    if (fingerprint) {
      fingerprint.fingerprint_id = fingerprint_id;
      fingerprint.registeredAt = new Date();
      await fingerprint.save();
    } else {
      fingerprint = new Fingerprint({ student_id, fingerprint_id });
      await fingerprint.save();
    }

    return res.json({ success: true, message: 'Huella registrada en base de datos' });
  } catch (error) {
    console.error('Error registrando huella:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// NUEVA RUTA: Buscar estudiante por ID de huella
router.get('/student/:fingerprintId', async (req: Request, res: Response) => {
  try {
    const { fingerprintId } = req.params;

    const fingerprint = await Fingerprint.findOne({ fingerprint_id: parseInt(fingerprintId) });

    if (!fingerprint) {
      return res.status(404).json({ success: false, message: 'Huella no encontrada' });
    }

    const student = await Student.findOne({ student_id: fingerprint.student_id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    return res.json({ success: true, student });
  } catch (error) {
    console.error('Error buscando estudiante por huella:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;
