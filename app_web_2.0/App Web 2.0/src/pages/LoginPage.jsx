import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor, ingresa correo y contraseña.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log(' Attempting login...');
      const result = await login(email, password);

      if (result.success) {
        console.log(' Login successful, redirecting...');
        navigate('/', { replace: true });
      } else {
        console.log(' Login failed:', result.error);
        // El toast ya se muestra en el contexto
      }
    } catch (error) {
      console.error(' Login error:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error durante el inicio de sesión',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center bg-cover bg-no-repeat bg-center p-4"
      style={{ backgroundImage: "url('/fondo.png')" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl bg-card border-secondary/50">
          <CardHeader className="text-center">
            <motion.div
              className="mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            >
              <img src="/utd.png" alt="Logo UTD Tools" className="h-16 mx-auto" />
            </motion.div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-700">Tools</CardTitle>
            <CardDescription className="text-muted-foreground">
              Ingresa tus credenciales de administrador.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-secondary">
                  Correo Institucional
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nombre.apellido@utd.edu.mx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 bg-input border-secondary/30 focus:border-secondary text-foreground"
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-secondary">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 bg-input border-secondary/30 focus:border-secondary text-foreground"
                  />
                </div>
              </div>

              {/* Botón de login */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-opacity duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando Sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} UTD Tools. Todos los derechos reservados.</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;