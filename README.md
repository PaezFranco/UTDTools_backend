# Sistema de Control de Caseta

## Características principales
Registro y autenticación de usuarios mediante credenciales y huella digital (sensor AS608), gestión de estudiantes, supervisor y herramientas, préstamos y devoluciones de herramientas en tiempo real, control de acceso basado en roles (supervisor, estudiante), bloqueo y desbloqueo de usuarios con motivo registrado, registro histórico de préstamos y accesos, panel web para administración y control, y aplicación móvil para escaneo de huella y operaciones rápidas.

## Tecnologías usadas
Backend: Node.js, Express, TypeScript, MongoDB Atlas, JWT, Helmet, Lusca, Rate-Limit. 
Frontend Web: React con Vite, Axios, Tailwind CSS.
Aplicación Móvil: React Native con Expo. 
Otros en backend: Mongoose, bcrypt, express-session, connect-mongo, CORS configurado, CSRF Token.

## Requisitos previos
Node.js v18, npm v9, MongoDB Atlas, cuenta Expo para ejecutar la app móvil, Git para clonar el repositorio y conexión a internet para interactuar con la base de datos en la nube.

## Instrucciones de instalación
1. Clonar el repositorio:
```bash
git clone https://github.com/PaezFranco/UTDTools_backend.git
cd UTDTools_backend
```
2. Configurar variables de entorno en la raíz del backend creando un archivo .env con:
PORT=3000
  
  ## Base de datos
  MONGO_URI=mongodb+srv://lux:LUX_ACP25@clustercaseta.jf2kbgt.mongodb.net/sistema_control_caseta?retryWrites=true&w=majority&appName=ClusterCaseta
  
  ## Tokens
  JWT_SECRET=xv9fN7g@p!B93DkYuz8La1$EeM*W0Zr
  REFRESH_TOKEN_SECRET=mV!jfNRo9*Wfonvdkkmc33$05G@18TVM*
  ACCESS_TOKEN_EXPIRES_IN=15m
  REFRESH_TOKEN_EXPIRES_IN=7d
  
  ## Secrets para seguridad 
  SESSION_SECRET=kL9mN2pQ7wE5rT8yU1iO3sD6fG0hJ4aZ9xC2vB7nM5qW8eR1tY4uI6oP3sD9fG2hJ5kL8zA
  CSRF_SECRET=pQ2wE5rT8yU1iO6sD9fG3hJ5kL7nM4qW0eR6tY1uI8oP2sD5fG9hJ3kL7zA4xC6vB9nM2wE
  
  ## Entorno y CORS
  ## NODE_ENV=development
  ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
  
  ## Admin script
  ADMIN_PASSWORD=admin123
  
  ## Gemini API Key
  GEMINI_API_KEY=AIzaSyA9w55FEibrf4f-1sEG27TZACScZ2cjAdw
  
  ## Configuración de Gmail
  GMAIL_USER=utdtools@gmail.com
  GMAIL_APP_PASSWORD=rnvl ckad jpde zbnr
  MAIL_FROM_NAME=Sistema Préstamos UTD
  INSTITUTION_NAME=Universidad Tecnológica de Durango

3. Instalar dependencias del backend:
   ```bash
   npm install
   ```
4. Instalar dependencias del frontend web
   ```bash
   cd frontend
    npm install
   ```
5. Instalar dependencias de la app móvil
   ```bash
    cd mobile
    npm install
    ```
6. Ejecutar el backend
    ```bash
     npm run dev
    ```
7. Ejecutar el frontend web:
    ```bash
    cd frontend
    npm run dev
    ```

8. Ejecutar la app móvil:
    ```bash
     cd mobile
     npx expo start
    ```


