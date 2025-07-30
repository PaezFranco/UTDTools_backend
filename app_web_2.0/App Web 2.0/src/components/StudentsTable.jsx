
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, UserCheck, UserX, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentsTable = ({ students, onViewProfile, onToggleStatus, onEdit, onDelete }) => {
  return (
    <motion.div
      className="rounded-lg border border-border shadow-sm bg-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
              <TableHead className="text-custom-gold px-3 py-3 whitespace-nowrap min-w-[100px]">Matrícula</TableHead>
              <TableHead className="text-custom-gold px-3 py-3 whitespace-nowrap min-w-[180px]">Nombre</TableHead>
              <TableHead className="text-custom-gold px-3 py-3 hidden md:table-cell whitespace-nowrap min-w-[180px]">Carrera</TableHead>
              <TableHead className="text-custom-gold px-3 py-3 hidden lg:table-cell whitespace-nowrap min-w-[200px]">Email</TableHead>
              <TableHead className="text-custom-gold px-3 py-3 whitespace-nowrap min-w-[90px]">Estado</TableHead>
              
              <TableHead className="text-custom-gold px-3 py-3 text-right whitespace-nowrap min-w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="hover:bg-muted/20 transition-colors">
                <TableCell className="font-medium text-foreground px-3 py-3 whitespace-nowrap">{student.studentId}</TableCell>
                <TableCell
                  className="text-foreground hover:underline cursor-pointer px-3 py-3 whitespace-nowrap max-w-[180px] truncate"
                  onClick={() => onViewProfile(student.id)}
                  title={student.name}
                >
                  {student.name}
                </TableCell>
                <TableCell
                  className="text-muted-foreground hidden md:table-cell px-3 py-3 whitespace-nowrap max-w-[180px] truncate"
                  title={student.career}
                >
                  {student.career}
                </TableCell>
                <TableCell
                  className="text-muted-foreground hidden lg:table-cell px-3 py-3 whitespace-nowrap max-w-[200px] truncate"
                  title={student.email}
                >
                  {student.email}
                </TableCell>
                <TableCell className="px-3 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    student.status === 'Activo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {student.status}
                  </span>
                </TableCell>
               
                <TableCell className="text-right px-3 py-3">
                  <div className="flex flex-col items-end space-y-0.5 xs:flex-row xs:space-y-0 xs:space-x-0.5 xs:items-center xs:justify-end">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewProfile(student.id)}
                        className="text-primary hover:text-primary/80 h-7 w-7"
                        title="Ver perfil"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStatus(student.id)}
                        className={`${student.status === 'Activo' ? "text-red-500 hover:text-red-400" : "text-green-500 hover:text-green-400"} h-7 w-7`}
                        title={student.status === 'Activo' ? 'Bloquear' : 'Activar'}
                      >
                        {student.status === 'Activo' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(student)}
                        className="text-blue-500 hover:text-blue-400 h-7 w-7"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(student)}
                        className="text-destructive hover:text-destructive/80 h-7 w-7"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default StudentsTable;
