
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScanLine } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';


const ToolForm = ({ currentTool, handleInputChange, handleCategoryChange, handleSimulateScan, isScanningBarcode, isEditing, onSubmit, predefinedCategories }) => {
  const { toast } = useToast();

  const localHandleCategoryChange = (value) => {
    if (value === 'crear_nueva_categoria_placeholder') {
      toast({
        title: "Función no implementada",
        description: "🚧 La creación de nuevas categorías directamente desde aquí aún no está disponible. Puedes añadirla manualmente o solicitar esta función. 🚀",
      });
      return;
    }
    handleCategoryChange(value);
  };
  
  return (
    <form onSubmit={onSubmit} id="tool-form" className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="uniqueId-modal-tool" className="text-right text-custom-gold">ID Único / Cód. Barras</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Input 
            id="uniqueId-modal-tool" 
            name="uniqueId" 
            value={currentTool?.uniqueId || ''} 
            onChange={handleInputChange} 
            className="bg-input border-custom-gold/30 focus:border-custom-gold" 
            required 
            placeholder="Escanear o ingresar ID"
            readOnly={isEditing} 
          />
          {!isEditing && (
             <Button type="button" variant="outline" size="icon" onClick={handleSimulateScan} disabled={isScanningBarcode} className="border-primary text-primary hover:bg-primary/10">
                 <ScanLine className={`h-5 w-5 ${isScanningBarcode ? 'animate-pulse' : ''}`} />
             </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="specificName-modal-tool" className="text-right text-custom-gold">Nombre Específico</Label>
        <Input id="specificName-modal-tool" name="specificName" value={currentTool?.specificName || ''} onChange={handleInputChange} className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold" required placeholder="Ej: Taladro Bosch #1"/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="generalName-modal-tool" className="text-right text-custom-gold">Nombre General</Label>
        <Input id="generalName-modal-tool" name="generalName" value={currentTool?.generalName || ''} onChange={handleInputChange} className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold" required placeholder="Ej: Taladro Percutor Bosch GSB 550 RE"/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category-modal-tool" className="text-right text-custom-gold">Categoría</Label>
        <Select 
          value={currentTool?.category || ''} 
          onValueChange={localHandleCategoryChange}
        >
          <SelectTrigger className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold text-foreground">
            <SelectValue placeholder="Seleccione una categoría" />
          </SelectTrigger>
          <SelectContent className="bg-card border-custom-gold/50 text-foreground">
            {predefinedCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
            <SelectItem value="crear_nueva_categoria_placeholder" className="text-primary italic">
              + Crear Nueva Categoría...
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status-modal-tool" className="text-right text-custom-gold">Estado General</Label>
        <Select 
            value={currentTool?.status || 'Disponible'} 
            onValueChange={(value) => handleInputChange({target: {name: 'status', value}})}
        >
            <SelectTrigger className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold text-foreground">
                <SelectValue placeholder="Seleccione estado general" />
            </SelectTrigger>
            <SelectContent className="bg-card border-custom-gold/50 text-foreground">
                <SelectItem value="Disponible">Disponible</SelectItem>
                <SelectItem value="En Préstamo">En Préstamo</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="maintenance_status-modal-tool" className="text-right text-custom-gold">Estado Mant.</Label>
        <Select 
          value={currentTool?.category === 'Consumible' ? 'N/A' : (currentTool?.maintenance_status || 'OK')} 
          onValueChange={(value) => handleInputChange({target: {name: 'maintenance_status', value}})}
          disabled={currentTool?.category === 'Consumible'}
        >
            <SelectTrigger className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold text-foreground" disabled={currentTool?.category === 'Consumible'}>
                <SelectValue placeholder="Seleccione estado de mantenimiento" />
            </SelectTrigger>
            <SelectContent className="bg-card border-custom-gold/50 text-foreground">
                <SelectItem value="OK">OK</SelectItem>
                <SelectItem value="Sugerido">Sugerido</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
                {currentTool?.category === 'Consumible' && <SelectItem value="N/A">N/A (Consumible)</SelectItem>}
            </SelectContent>
        </Select>
      </div>
      {(currentTool?.category !== 'Consumible') && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="last_maintenance-modal-tool" className="text-right text-custom-gold">Último Mant.</Label>
            <Input id="last_maintenance-modal-tool" name="last_maintenance" type="date" value={currentTool?.last_maintenance || ''} onChange={handleInputChange} className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="next_maintenance-modal-tool" className="text-right text-custom-gold">Próximo Mant.</Label>
            <Input id="next_maintenance-modal-tool" name="next_maintenance" type="date" value={currentTool?.next_maintenance || ''} onChange={handleInputChange} className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold" />
          </div>
        </>
      )}
      {isEditing && typeof currentTool?.usage_count === 'number' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="usage_count-modal-tool" className="text-right text-custom-gold">Nº Usos</Label>
          <Input id="usage_count-modal-tool" name="usage_count" type="number" min="0" value={currentTool?.usage_count || 0} onChange={handleInputChange} className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold" />
        </div>
      )}
    </form>
  );
};

export default ToolForm;