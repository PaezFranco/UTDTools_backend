// import { Request, Response } from 'express';
// import Tool from '../Models/Tool.model';

// // Función para sanitizar entrada de usuario y prevenir ReDoS
// const sanitizeRegexInput = (input: string): string => {
//   // Escapar caracteres especiales de regex para prevenir ReDoS
//   return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// };

// // Función para validar longitud de query y caracteres permitidos
// const validateSearchQuery = (query: string): { isValid: boolean; sanitized: string } => {
//   // Limitar longitud para prevenir ataques
//   if (query.length > 100) {
//     return { isValid: false, sanitized: '' };
//   }
  
//   // Permitir solo caracteres alfanuméricos, espacios, guiones y algunos símbolos básicos
//   const allowedCharsRegex = /^[a-zA-Z0-9\s\-_\.#]+$/;
//   if (!allowedCharsRegex.test(query)) {
//     return { isValid: false, sanitized: '' };
//   }
  
//   // Sanitizar la entrada
//   const sanitized = sanitizeRegexInput(query.trim());
//   return { isValid: true, sanitized };
// };

// // Regex constante para validar MongoDB ObjectIds
// const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// // Obtener todas las herramientas
// export const getAllTools = async (_req: Request, res: Response) => {
//   try {
//     const tools = await Tool.find()
//       .populate('assigned_supervisor', 'name email')
//       .sort({ createdAt: -1 });

//     console.log(`Returning ${tools.length} tools from database`);
//     res.json(tools);
//   } catch (error: any) {
//     console.error('Error al obtener herramientas:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor al obtener herramientas',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Obtener herramienta por ID
// export const getToolById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     console.log(`Searching for tool with ID: ${id}`);

//     if (!MONGO_ID_REGEX.test(id)) {
//       console.log(`Invalid tool ID format: ${id}`);
//       return res.status(400).json({ message: 'ID de herramienta inválido' });
//     }

//     const tool = await Tool.findById(id).populate('assigned_supervisor', 'name email');
//     if (!tool) {
//       console.log(`Tool not found with ID: ${id}`);
//       return res.status(404).json({ message: 'Herramienta no encontrada' });
//     }

//     console.log(`Tool found: ${tool.specificName || tool.name}`);
//     res.json(tool);
//   } catch (error: any) {
//     console.error('Error al obtener herramienta por ID:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor al obtener la herramienta',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Crear nueva herramienta
// export const createTool = async (req: Request, res: Response) => {
//   try {
//     const {
//       uniqueId,
//       specificName,
//       generalName,
//       category,
//       status,
//       maintenance_status,
//       last_maintenance,
//       next_maintenance,
//       usage_count,
//       description,
//       image,
//       assigned_supervisor,
//       total_quantity,
//       available_quantity
//     } = req.body;

//     // Validaciones básicas
//     if (!uniqueId || !specificName || !generalName || !category) {
//       return res.status(400).json({
//         message: 'Los campos uniqueId, specificName, generalName y category son obligatorios'
//       });
//     }

//     // Limpiar y validar uniqueId
//     // file deepcode ignore HTTPSourceWithUncheckedType: <please specify a reason of ignoring this>
//     const cleanUniqueId = uniqueId.toString().trim();
//     if (!cleanUniqueId || cleanUniqueId.length > 50) {
//       return res.status(400).json({
//         message: 'El uniqueId no puede estar vacío y debe tener menos de 50 caracteres'
//       });
//     }

//     // Verificar si ya existe una herramienta con el mismo uniqueId
//     const existingTool = await Tool.findOne({ uniqueId: cleanUniqueId });
//     if (existingTool) {
//       return res.status(409).json({
//         message: `Ya existe una herramienta con el ID único: ${cleanUniqueId}`,
//         existingTool: {
//           _id: existingTool._id,
//           uniqueId: existingTool.uniqueId,
//           specificName: existingTool.specificName
//         }
//       });
//     }

//     // Configurar valores por defecto
//     const defaultValues: any = {
//       status: status || 'Disponible',
//       usage_count: usage_count || 0,
//       total_quantity: total_quantity || 1,
//       available_quantity: available_quantity || total_quantity || 1,
//       accumulated_use: 0,
//       average_use_time: 0,
//       maintenance_alert: false
//     };

//     // Configuración específica para consumibles
//     if (category === 'Consumible') {
//       defaultValues.maintenance_status = 'N/A';
//       defaultValues.last_maintenance = undefined;
//       defaultValues.next_maintenance = undefined;
//     } else {
//       defaultValues.maintenance_status = maintenance_status || 'OK';
//       defaultValues.last_maintenance = last_maintenance || new Date();
      
//       // Establecer próximo mantenimiento a 6 meses si no se proporciona
//       if (!next_maintenance) {
//         const nextMaintenanceDate = new Date();
//         nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 6);
//         defaultValues.next_maintenance = nextMaintenanceDate;
//       } else {
//         defaultValues.next_maintenance = new Date(next_maintenance);
//       }
//     }

//     const newTool = new Tool({
//       uniqueId: cleanUniqueId,
//       specificName: specificName.trim(),
//       generalName: generalName.trim(),
//       category,
//       description: description?.trim(),
//       image: image?.trim(),
//       assigned_supervisor: assigned_supervisor || undefined,
//       ...defaultValues
//     });

//     const savedTool = await newTool.save();
//     await savedTool.populate('assigned_supervisor', 'name email');

//     console.log(`Tool created successfully: ${savedTool.specificName} (${savedTool.uniqueId})`);
//     res.status(201).json(savedTool);
//   } catch (error: any) {
//     console.error('Error al crear herramienta:', error);

//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         message: 'Datos de herramienta inválidos',
//         details: Object.values(error.errors).map((err: any) => err.message)
//       });
//     }

//     if (error.code === 11000) {
//       // Error de duplicado de MongoDB
//       const field = Object.keys(error.keyValue)[0];
//       const value = error.keyValue[field];
//       return res.status(409).json({
//         message: `Ya existe una herramienta con ${field}: ${value}`
//       });
//     }

//     res.status(500).json({
//       message: 'Error interno del servidor al crear la herramienta',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Actualizar herramienta
// export const updateTool = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     if (!MONGO_ID_REGEX.test(id)) {
//       return res.status(400).json({ message: 'ID de herramienta inválido' });
//     }

//     const existingTool = await Tool.findById(id);
//     if (!existingTool) {
//       return res.status(404).json({ message: 'Herramienta no encontrada' });
//     }

//     // Verificar uniqueId duplicado si se está cambiando
//     if (updateData.uniqueId && updateData.uniqueId !== existingTool.uniqueId) {
//       const cleanUniqueId = updateData.uniqueId.toString().trim();
//       if (cleanUniqueId.length > 50) {
//         return res.status(400).json({
//           message: 'El uniqueId debe tener menos de 50 caracteres'
//         });
//       }

//       const duplicateTool = await Tool.findOne({
//         uniqueId: cleanUniqueId,
//         _id: { $ne: id }
//       });
//       if (duplicateTool) {
//         return res.status(409).json({
//           message: `Ya existe otra herramienta con el ID único: ${cleanUniqueId}`,
//           existingTool: {
//             _id: duplicateTool._id,
//             uniqueId: duplicateTool.uniqueId,
//             specificName: duplicateTool.specificName
//           }
//         });
//       }
//     }

//     // Limpiar datos de entrada
//     const cleanedData: any = {
//       ...updateData,
//       uniqueId: updateData.uniqueId?.toString().trim(),
//       specificName: updateData.specificName?.trim(),
//       generalName: updateData.generalName?.trim(),
//       description: updateData.description?.trim(),
//       image: updateData.image?.trim()
//     };

//     // Lógica especial para consumibles
//     if (cleanedData.category === 'Consumible') {
//       cleanedData.maintenance_status = 'N/A';
//       cleanedData.last_maintenance = undefined;
//       cleanedData.next_maintenance = undefined;
//     }

//     const updatedTool = await Tool.findByIdAndUpdate(
//       id,
//       cleanedData,
//       { new: true, runValidators: true }
//     ).populate('assigned_supervisor', 'name email');

//     console.log(`Tool updated successfully: ${updatedTool?.specificName} (${updatedTool?.uniqueId})`);
//     res.json(updatedTool);
//   } catch (error: any) {
//     console.error('Error al actualizar herramienta:', error);

//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         message: 'Datos de actualización inválidos',
//         details: Object.values(error.errors).map((err: any) => err.message)
//       });
//     }

//     if (error.code === 11000) {
//       const field = Object.keys(error.keyValue)[0];
//       const value = error.keyValue[field];
//       return res.status(409).json({
//         message: `Ya existe una herramienta con ${field}: ${value}`
//       });
//     }

//     res.status(500).json({
//       message: 'Error interno del servidor al actualizar la herramienta',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Eliminar herramienta
// export const deleteTool = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     if (!MONGO_ID_REGEX.test(id)) {
//       return res.status(400).json({ message: 'ID de herramienta inválido' });
//     }

//     const deletedTool = await Tool.findByIdAndDelete(id);
//     if (!deletedTool) {
//       return res.status(404).json({ message: 'Herramienta no encontrada' });
//     }

//     console.log(`Tool deleted successfully: ${deletedTool.specificName} (${deletedTool.uniqueId})`);
//     res.json({
//       message: 'Herramienta eliminada exitosamente',
//       deletedTool: {
//         _id: deletedTool._id,
//         uniqueId: deletedTool.uniqueId,
//         specificName: deletedTool.specificName
//       }
//     });
//   } catch (error: any) {
//     console.error('Error al eliminar herramienta:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor al eliminar la herramienta',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Obtener herramientas por categoría
// export const getToolsByCategory = async (req: Request, res: Response) => {
//   try {
//     const { category } = req.params;
    
//     // Sanitizar entrada de categoría
//     const sanitizedCategory = category.trim();
//     if (sanitizedCategory.length > 50) {
//       return res.status(400).json({ message: 'Categoría inválida' });
//     }
    
//     console.log(`Searching tools by category: ${sanitizedCategory}`);
    
//     // Usar coincidencia exacta en lugar de regex para prevenir ReDoS
//     const tools = await Tool.find({ category: sanitizedCategory })
//       .populate('assigned_supervisor', 'name email')
//       .sort({ specificName: 1 });

//     console.log(`Found ${tools.length} tools in category: ${sanitizedCategory}`);
//     res.json(tools);
//   } catch (error: any) {
//     console.error('Error al obtener herramientas por categoría:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Obtener herramientas por estado
// export const getToolsByStatus = async (req: Request, res: Response) => {
//   try {
//     const { status } = req.params;
    
//     // Sanitizar entrada de estado
//     const sanitizedStatus = status.trim();
//     if (sanitizedStatus.length > 30) {
//       return res.status(400).json({ message: 'Estado inválido' });
//     }
    
//     console.log(`Searching tools by status: ${sanitizedStatus}`);
    
//     // Usar coincidencia exacta en lugar de regex para prevenir ReDoS
//     const tools = await Tool.find({ status: sanitizedStatus })
//       .populate('assigned_supervisor', 'name email')
//       .sort({ specificName: 1 });

//     console.log(`Found ${tools.length} tools with status: ${sanitizedStatus}`);
//     res.json(tools);
//   } catch (error: any) {
//     console.error('Error al obtener herramientas por estado:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Verificar si un uniqueId ya existe
// export const checkUniqueId = async (req: Request, res: Response) => {
//   try {
//     const { uniqueId } = req.params;
//     const { excludeId } = req.query;

//     console.log(`Checking uniqueId: ${uniqueId}, excludeId: ${excludeId}`);

//     const cleanUniqueId = uniqueId.toString().trim();
    
//     // Validar longitud del uniqueId
//     if (cleanUniqueId.length > 50) {
//       return res.status(400).json({ message: 'uniqueId demasiado largo' });
//     }
    
//     const query: any = { uniqueId: cleanUniqueId };
//     if (excludeId) {
//       // Validar excludeId si se proporciona
//       if (MONGO_ID_REGEX.test(excludeId.toString())) {
//         query._id = { $ne: excludeId };
//       }
//     }

//     const existingTool = await Tool.findOne(query);
    
//     console.log(`UniqueId check result: ${existingTool ? 'EXISTS' : 'AVAILABLE'}`);
    
//     res.json({ 
//       exists: !!existingTool,
//       tool: existingTool ? {
//         _id: existingTool._id,
//         uniqueId: existingTool.uniqueId,
//         specificName: existingTool.specificName
//       } : null
//     });
//   } catch (error: any) {
//     console.error('Error al verificar uniqueId:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Búsqueda avanzada de herramientas (CORREGIDA PARA PREVENIR ReDoS)
// export const searchTools = async (req: Request, res: Response) => {
//   try {
//     const { query } = req.params;
    
//     // Validar y sanitizar la query de búsqueda
//     const validation = validateSearchQuery(query);
//     if (!validation.isValid) {
//       return res.status(400).json({
//         message: 'Query de búsqueda inválida. Use solo caracteres alfanuméricos, espacios, guiones y puntos.'
//       });
//     }
    
//     const cleanQuery = validation.sanitized.toLowerCase();
//     console.log(`Advanced search for tools with sanitized query: ${cleanQuery}`);

//     // Usar búsqueda con entrada sanitizada para prevenir ReDoS
//     const tools = await Tool.find({
//       $or: [
//         { uniqueId: { $regex: cleanQuery, $options: 'i' } },
//         { specificName: { $regex: cleanQuery, $options: 'i' } },
//         { generalName: { $regex: cleanQuery, $options: 'i' } },
//         { category: { $regex: cleanQuery, $options: 'i' } },
//         { description: { $regex: cleanQuery, $options: 'i' } },
//         { brand: { $regex: cleanQuery, $options: 'i' } },
//         { model: { $regex: cleanQuery, $options: 'i' } }
//       ]
//     })
//     .populate('assigned_supervisor', 'name email')
//     .limit(50) // Limitar resultados para prevenir sobrecarga
//     .sort({ specificName: 1 });

//     console.log(`Found ${tools.length} tools matching query: ${cleanQuery}`);
//     res.json(tools);
//   } catch (error: any) {
//     console.error('Error en búsqueda avanzada de herramientas:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

import { Request, Response } from 'express';
import Tool from '../Models/Tool.model';

// Función para sanitizar entrada de usuario y prevenir ReDoS
const sanitizeRegexInput = (input: string): string => {
  // Escapar caracteres especiales de regex para prevenir ReDoS
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Función para validar longitud de query y caracteres permitidos
const validateSearchQuery = (query: string): { isValid: boolean; sanitized: string } => {
  // Limitar longitud para prevenir ataques
  if (query.length > 100) {
    return { isValid: false, sanitized: '' };
  }
  
  // Permitir solo caracteres alfanuméricos, espacios, guiones y algunos símbolos básicos
  const allowedCharsRegex = /^[a-zA-Z0-9\s\-_\.#]+$/;
  if (!allowedCharsRegex.test(query)) {
    return { isValid: false, sanitized: '' };
  }
  
  // Sanitizar la entrada
  const sanitized = sanitizeRegexInput(query.trim());
  return { isValid: true, sanitized };
};

// Regex constante para validar MongoDB ObjectIds
const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// Obtener todas las herramientas
export const getAllTools = async (_req: Request, res: Response) => {
  try {
    const tools = await Tool.find()
      .populate('assigned_supervisor', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Returning ${tools.length} tools from database`);
    res.json(tools);
  } catch (error: any) {
    console.error('Error al obtener herramientas:', error);
    res.status(500).json({
      message: 'Error interno del servidor al obtener herramientas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener herramienta por ID
export const getToolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`Searching for tool with ID: ${id}`);

    if (!MONGO_ID_REGEX.test(id)) {
      console.log(`Invalid tool ID format: ${id}`);
      return res.status(400).json({ message: 'ID de herramienta inválido' });
    }

    const tool = await Tool.findById(id).populate('assigned_supervisor', 'name email');
    if (!tool) {
      console.log(`Tool not found with ID: ${id}`);
      return res.status(404).json({ message: 'Herramienta no encontrada' });
    }

    console.log(`Tool found: ${tool.specificName || tool.name}`);
    res.json(tool);
  } catch (error: any) {
    console.error('Error al obtener herramienta por ID:', error);
    res.status(500).json({
      message: 'Error interno del servidor al obtener la herramienta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Crear nueva herramienta
export const createTool = async (req: Request, res: Response) => {
  try {
    const {
      uniqueId,
      specificName,
      generalName,
      category,
      status,
      maintenance_status,
      last_maintenance,
      next_maintenance,
      usage_count,
      description,
      image,
      assigned_supervisor,
      total_quantity,
      available_quantity
    } = req.body;

    // Validaciones básicas
    if (!uniqueId || !specificName || !generalName || !category) {
      return res.status(400).json({
        message: 'Los campos uniqueId, specificName, generalName y category son obligatorios'
      });
    }

    // Limpiar y validar uniqueId
    // file deepcode ignore HTTPSourceWithUncheckedType: <please specify a reason of ignoring this>
    const cleanUniqueId = uniqueId.toString().trim();
    if (!cleanUniqueId || cleanUniqueId.length > 50) {
      return res.status(400).json({
        message: 'El uniqueId no puede estar vacío y debe tener menos de 50 caracteres'
      });
    }

    // Verificar si ya existe una herramienta con el mismo uniqueId
    const existingTool = await Tool.findOne({ uniqueId: cleanUniqueId });
    if (existingTool) {
      return res.status(409).json({
        message: `Ya existe una herramienta con el ID único: ${cleanUniqueId}`,
        existingTool: {
          _id: existingTool._id,
          uniqueId: existingTool.uniqueId,
          specificName: existingTool.specificName
        }
      });
    }

    // Configurar valores por defecto
    const defaultValues: any = {
      status: status || 'Disponible',
      usage_count: usage_count || 0,
      total_quantity: total_quantity || 1,
      available_quantity: available_quantity || total_quantity || 1,
      accumulated_use: 0,
      average_use_time: 0,
      maintenance_alert: false
    };

    // Configuración específica para consumibles
    if (category === 'Consumible') {
      defaultValues.maintenance_status = 'N/A';
      defaultValues.last_maintenance = undefined;
      defaultValues.next_maintenance = undefined;
    } else {
      defaultValues.maintenance_status = maintenance_status || 'OK';
      defaultValues.last_maintenance = last_maintenance || new Date();
      
      // Establecer próximo mantenimiento a 6 meses si no se proporciona
      if (!next_maintenance) {
        const nextMaintenanceDate = new Date();
        nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 6);
        defaultValues.next_maintenance = nextMaintenanceDate;
      } else {
        defaultValues.next_maintenance = new Date(next_maintenance);
      }
    }

    const newTool = new Tool({
      uniqueId: cleanUniqueId,
      specificName: specificName.trim(),
      generalName: generalName.trim(),
      category,
      description: description?.trim(),
      image: image?.trim(),
      assigned_supervisor: assigned_supervisor || undefined,
      ...defaultValues
    });

    const savedTool = await newTool.save();
    await savedTool.populate('assigned_supervisor', 'name email');

    console.log(`Tool created successfully: ${savedTool.specificName} (${savedTool.uniqueId})`);
    res.status(201).json(savedTool);
  } catch (error: any) {
    console.error('Error al crear herramienta:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Datos de herramienta inválidos',
        details: Object.values(error.errors).map((err: any) => err.message)
      });
    }

    if (error.code === 11000) {
      // Error de duplicado de MongoDB
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(409).json({
        message: `Ya existe una herramienta con ${field}: ${value}`
      });
    }

    res.status(500).json({
      message: 'Error interno del servidor al crear la herramienta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar herramienta
export const updateTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!MONGO_ID_REGEX.test(id)) {
      return res.status(400).json({ message: 'ID de herramienta inválido' });
    }

    const existingTool = await Tool.findById(id);
    if (!existingTool) {
      return res.status(404).json({ message: 'Herramienta no encontrada' });
    }

    // Verificar uniqueId duplicado si se está cambiando
    if (updateData.uniqueId && updateData.uniqueId !== existingTool.uniqueId) {
      const cleanUniqueId = updateData.uniqueId.toString().trim();
      if (cleanUniqueId.length > 50) {
        return res.status(400).json({
          message: 'El uniqueId debe tener menos de 50 caracteres'
        });
      }

      const duplicateTool = await Tool.findOne({
        uniqueId: cleanUniqueId,
        _id: { $ne: id }
      });
      if (duplicateTool) {
        return res.status(409).json({
          message: `Ya existe otra herramienta con el ID único: ${cleanUniqueId}`,
          existingTool: {
            _id: duplicateTool._id,
            uniqueId: duplicateTool.uniqueId,
            specificName: duplicateTool.specificName
          }
        });
      }
    }

    // Limpiar datos de entrada
    const cleanedData: any = {
      ...updateData,
      uniqueId: updateData.uniqueId?.toString().trim(),
      specificName: updateData.specificName?.trim(),
      generalName: updateData.generalName?.trim(),
      description: updateData.description?.trim(),
      image: updateData.image?.trim()
    };

    // Lógica especial para consumibles
    if (cleanedData.category === 'Consumible') {
      cleanedData.maintenance_status = 'N/A';
      cleanedData.last_maintenance = undefined;
      cleanedData.next_maintenance = undefined;
    }

    const updatedTool = await Tool.findByIdAndUpdate(
      id,
      cleanedData,
      { new: true, runValidators: true }
    ).populate('assigned_supervisor', 'name email');

    console.log(`Tool updated successfully: ${updatedTool?.specificName} (${updatedTool?.uniqueId})`);
    res.json(updatedTool);
  } catch (error: any) {
    console.error('Error al actualizar herramienta:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Datos de actualización inválidos',
        details: Object.values(error.errors).map((err: any) => err.message)
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(409).json({
        message: `Ya existe una herramienta con ${field}: ${value}`
      });
    }

    res.status(500).json({
      message: 'Error interno del servidor al actualizar la herramienta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar herramienta
export const deleteTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!MONGO_ID_REGEX.test(id)) {
      return res.status(400).json({ message: 'ID de herramienta inválido' });
    }

    const deletedTool = await Tool.findByIdAndDelete(id);
    if (!deletedTool) {
      return res.status(404).json({ message: 'Herramienta no encontrada' });
    }

    console.log(`Tool deleted successfully: ${deletedTool.specificName} (${deletedTool.uniqueId})`);
    res.json({
      message: 'Herramienta eliminada exitosamente',
      deletedTool: {
        _id: deletedTool._id,
        uniqueId: deletedTool.uniqueId,
        specificName: deletedTool.specificName
      }
    });
  } catch (error: any) {
    console.error('Error al eliminar herramienta:', error);
    res.status(500).json({
      message: 'Error interno del servidor al eliminar la herramienta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener herramientas por categoría
export const getToolsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    // Sanitizar entrada de categoría
    const sanitizedCategory = category.trim();
    if (sanitizedCategory.length > 50) {
      return res.status(400).json({ message: 'Categoría inválida' });
    }
    
    console.log(`Searching tools by category: ${sanitizedCategory}`);
    
    // Usar coincidencia exacta en lugar de regex para prevenir ReDoS
    const tools = await Tool.find({ category: sanitizedCategory })
      .populate('assigned_supervisor', 'name email')
      .sort({ specificName: 1 });

    console.log(`Found ${tools.length} tools in category: ${sanitizedCategory}`);
    res.json(tools);
  } catch (error: any) {
    console.error('Error al obtener herramientas por categoría:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener herramientas por estado
export const getToolsByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    
    // Sanitizar entrada de estado
    const sanitizedStatus = status.trim();
    if (sanitizedStatus.length > 30) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    
    console.log(`Searching tools by status: ${sanitizedStatus}`);
    
    // Usar coincidencia exacta en lugar de regex para prevenir ReDoS
    const tools = await Tool.find({ status: sanitizedStatus })
      .populate('assigned_supervisor', 'name email')
      .sort({ specificName: 1 });

    console.log(`Found ${tools.length} tools with status: ${sanitizedStatus}`);
    res.json(tools);
  } catch (error: any) {
    console.error('Error al obtener herramientas por estado:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verificar si un uniqueId ya existe
export const checkUniqueId = async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.params;
    const { excludeId } = req.query;

    console.log(`Checking uniqueId: ${uniqueId}, excludeId: ${excludeId}`);

    const cleanUniqueId = uniqueId.toString().trim();
    
    // Validar longitud del uniqueId
    if (cleanUniqueId.length > 50) {
      return res.status(400).json({ message: 'uniqueId demasiado largo' });
    }
    
    const query: any = { uniqueId: cleanUniqueId };
    if (excludeId) {
      // Validar excludeId si se proporciona
      if (MONGO_ID_REGEX.test(excludeId.toString())) {
        query._id = { $ne: excludeId };
      }
    }

    const existingTool = await Tool.findOne(query);
    
    console.log(`UniqueId check result: ${existingTool ? 'EXISTS' : 'AVAILABLE'}`);
    
    res.json({ 
      exists: !!existingTool,
      tool: existingTool ? {
        _id: existingTool._id,
        uniqueId: existingTool.uniqueId,
        specificName: existingTool.specificName
      } : null
    });
  } catch (error: any) {
    console.error('Error al verificar uniqueId:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Búsqueda avanzada de herramientas (CORREGIDA PARA PREVENIR ReDoS)
export const searchTools = async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    
    // Validar y sanitizar la query de búsqueda
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Query de búsqueda inválida. Use solo caracteres alfanuméricos, espacios, guiones y puntos.'
      });
    }
    
    const cleanQuery = validation.sanitized.toLowerCase();
    console.log(`Advanced search for tools with sanitized query: ${cleanQuery}`);

    // Usar búsqueda con entrada sanitizada para prevenir ReDoS
    const tools = await Tool.find({
      $or: [
        { uniqueId: { $regex: cleanQuery, $options: 'i' } },
        { specificName: { $regex: cleanQuery, $options: 'i' } },
        { generalName: { $regex: cleanQuery, $options: 'i' } },
        { category: { $regex: cleanQuery, $options: 'i' } },
        { description: { $regex: cleanQuery, $options: 'i' } },
        { brand: { $regex: cleanQuery, $options: 'i' } },
        { model: { $regex: cleanQuery, $options: 'i' } }
      ]
    })
    .populate('assigned_supervisor', 'name email')
    .limit(50) // Limitar resultados para prevenir sobrecarga
    .sort({ specificName: 1 });

    console.log(`Found ${tools.length} tools matching query: ${cleanQuery}`);
    res.json(tools);
  } catch (error: any) {
    console.error('Error en búsqueda avanzada de herramientas:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// AGREGAR estas funciones al final de Tool.controller.ts

// Obtener herramientas para estudiantes (solo lectura)
export const getToolsForStudents = async (_req: Request, res: Response) => {
  try {
    console.log('Getting tools for students (read-only)');
    
    const tools = await Tool.find()
      .select('uniqueId specificName generalName category status total_quantity available_quantity description')
      .sort({ category: 1, specificName: 1 });

    // Formatear datos para la app móvil
    const formattedTools = tools.map(tool => ({
      id: tool.uniqueId,
      name: tool.specificName,
      description: tool.description || tool.generalName,
      category: tool.category,
      condition: tool.status === 'Disponible' ? 'Excelente' : 
                 tool.status === 'En Préstamo' ? 'Bueno' : 'Mantenimiento',
      available: tool.status === 'Disponible' ? (tool.available_quantity || 1) : 0,
  
      status: tool.status
    }));

    // Agrupar por categoría
    const groupedByCategory = formattedTools.reduce((acc: any, tool: any) => {
      const category = tool.category || 'Sin Categoría';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tool);
      return acc;
    }, {});

    console.log(`Returning ${formattedTools.length} tools grouped by category for students`);
    res.json(groupedByCategory);
  } catch (error: any) {
    console.error('Error al obtener herramientas para estudiantes:', error);
    res.status(500).json({
      message: 'Error interno del servidor al obtener herramientas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Buscar herramientas para estudiantes
export const searchToolsForStudents = async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    
    // Validar y sanitizar la query de búsqueda
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Query de búsqueda inválida'
      });
    }
    
    const cleanQuery = validation.sanitized.toLowerCase();
    console.log(`Student search for tools with query: ${cleanQuery}`);

    const tools = await Tool.find({
      $or: [
        { uniqueId: { $regex: cleanQuery, $options: 'i' } },
        { specificName: { $regex: cleanQuery, $options: 'i' } },
        { generalName: { $regex: cleanQuery, $options: 'i' } },
        { category: { $regex: cleanQuery, $options: 'i' } },
        { description: { $regex: cleanQuery, $options: 'i' } }
      ]
    })
    .select('uniqueId specificName generalName category status total_quantity available_quantity description')
    .limit(50)
    .sort({ specificName: 1 });

    // Formatear datos para la app móvil
    const formattedTools = tools.map(tool => ({
      id: tool.uniqueId,
      name: tool.specificName,
      description: tool.description || tool.generalName,
      category: tool.category,
      condition: tool.status === 'Disponible' ? 'Excelente' : 
                 tool.status === 'En Préstamo' ? 'Bueno' : 'Mantenimiento',
      available: tool.status === 'Disponible' ? (tool.available_quantity || 1) : 0,
    
      status: tool.status
    }));

    console.log(`Found ${formattedTools.length} tools for student search`);
    res.json(formattedTools);
  } catch (error: any) {
    console.error('Error en búsqueda de herramientas para estudiantes:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener herramientas por categoría para estudiantes
export const getToolsByCategoryForStudents = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    const sanitizedCategory = category.trim();
    if (sanitizedCategory.length > 50) {
      return res.status(400).json({ message: 'Categoría inválida' });
    }
    
    console.log(`Getting tools by category for students: ${sanitizedCategory}`);
    
    const tools = await Tool.find({ category: sanitizedCategory })
      .select('uniqueId specificName generalName category status total_quantity available_quantity description')
      .sort({ specificName: 1 });

    // Formatear datos para la app móvil
    const formattedTools = tools.map(tool => ({
      id: tool.uniqueId,
      name: tool.specificName,
      description: tool.description || tool.generalName,
      category: tool.category,
      condition: tool.status === 'Disponible' ? 'Excelente' : 
                 tool.status === 'En Préstamo' ? 'Bueno' : 'Mantenimiento',
      available: tool.status === 'Disponible' ? (tool.available_quantity || 1) : 0,
      
      status: tool.status
    }));

    console.log(`Found ${formattedTools.length} tools in category: ${sanitizedCategory}`);
    res.json(formattedTools);
  } catch (error: any) {
    console.error('Error al obtener herramientas por categoría para estudiantes:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// AGREGA estas funciones al final de Tool.controller.ts

// Endpoint público para obtener herramientas (sin autenticación)
export const getToolsPublic = async (_req: Request, res: Response) => {
  try {
    console.log('Getting tools for mobile app (public)');
    
    const tools = await Tool.find()
      .select('uniqueId specificName generalName category status total_quantity available_quantity description')
      .sort({ category: 1, specificName: 1 });

    // Formatear datos para la app móvil
    const formattedTools = tools.map(tool => ({
      id: tool.uniqueId,
      name: tool.specificName,
      description: tool.description || tool.generalName,
      category: tool.category,
      condition: tool.status === 'Disponible' ? 'Excelente' : 
                 tool.status === 'En Préstamo' ? 'Bueno' : 'Mantenimiento',
      available: tool.status === 'Disponible' ? (tool.available_quantity || 1) : 0,
     
      status: tool.status
    }));

    // Agrupar por categoría
    const groupedByCategory = formattedTools.reduce((acc: any, tool: any) => {
      const category = tool.category || 'Sin Categoría';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tool);
      return acc;
    }, {});

    console.log(`Returning ${formattedTools.length} tools grouped by category`);
    res.json(groupedByCategory);
  } catch (error: any) {
    console.error('Error al obtener herramientas:', error);
    res.status(500).json({
      message: 'Error interno del servidor al obtener herramientas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};