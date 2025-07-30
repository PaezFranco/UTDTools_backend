// // En: app/(auth)/index.tsx
// import { Feather } from '@expo/vector-icons'; // <-- Se eliminó la importación de AntDesign
// import { Link, useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import {
//     Image,
//     ImageBackground,
//     Keyboard,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     TouchableWithoutFeedback,
//     View
// } from 'react-native';
// import CustomAlert from '../../components/CustomAlert';
// import PolicyModal from '../../components/PolicyModal';

// import BackgroundImage from '../../assets/images/fondito.png';
// import LogoImage from '../../assets/images/utd.png';

// // --- Textos de políticas y términos con estructura ---
// const privacyPolicyContent = [
//   { type: 'paragraph', text: 'Última Actualización: 14 de julio de 2025.' },
//   { type: 'paragraph', text: 'La presente Política de Privacidad tiene como finalidad informar a los usuarios sobre el tratamiento de sus datos personales al utilizar la aplicación móvil "UTD Tools", desarrollada por la Universidad Tecnológica de Durango. Su privacidad y la seguridad de su información son de máxima importancia para nosotros.' },
//   { type: 'heading', text: '1. Datos Recopilados' },
//   { type: 'paragraph', text: 'Con fines estrictamente académicos y administrativos, la aplicación recopila la siguiente información:' },
//   { type: 'listItem', text: 'Nombre completo del usuario.' },
//   { type: 'listItem', text: 'Matrícula institucional.' },
//   { type: 'listItem', text: 'Carrera y cuatrimestre.' },
//   { type: 'listItem', text: 'Correo electrónico institucional.' },
//   { type: 'listItem', text: 'Historial de préstamos y devoluciones de herramientas.' },
//   { type: 'listItem', text: 'Datos biométricos: Utilizados exclusivamente para autenticación. La aplicación no almacena imágenes ni representaciones de la huella.' },
//   { type: 'heading', text: '2. Uso de la Información' },
//   { type: 'paragraph', text: 'La información recopilada se utiliza única y exclusivamente para los siguientes propósitos:' },
//   { type: 'listItem', text: 'Validar la identidad del estudiante.' },
//   { type: 'listItem', text: 'Registrar y consultar movimientos en el sistema.' },
//   { type: 'listItem', text: 'Generar reportes institucionales de uso.' },
//   { type: 'listItem', text: 'Enviar notificaciones relevantes sobre su cuenta.' },
//   { type: 'heading', text: '3. Almacenamiento y Seguridad' },
//   { type: 'paragraph', text: 'La información se almacena de forma segura en una base de datos en la nube (MongoDB Atlas), implementando protocolos de encriptación. La autenticación biométrica se gestiona a través de una API externa segura que procesa la validación sin almacenar datos biométricos en la aplicación móvil.' },
//   { type: 'heading', text: '4. Divulgación de Información' },
//   { type: 'paragraph', text: 'La Universidad Tecnológica de Durango se compromete a no compartir, vender o divulgar datos personales de los usuarios con terceros, salvo requerimiento legal expreso de una autoridad competente.' },
//   { type: 'heading', text: '5. Consentimiento' },
//   { type: 'paragraph', text: 'El uso de esta aplicación implica la aceptación expresa de esta Política de Privacidad y el consentimiento para el tratamiento de sus datos personales conforme a lo aquí descrito.' },
// ];

// const termsOfServiceContent = [
//     { type: 'paragraph', text: 'Última Actualización: 14 de julio de 2025.' },
//     { type: 'paragraph', text: 'Estos Términos y Condiciones regulan el uso de la aplicación móvil del Sistema de Control de Caseta del Edificio Pesado 1 de la Universidad Tecnológica de Durango. Al acceder y utilizar esta aplicación, el usuario acepta y se compromete a cumplir con las disposiciones aquí establecidas.'},
//     { type: 'heading', text: '1. Objeto de la Aplicación' },
//     { type: 'paragraph', text: 'La presente aplicación móvil tiene como finalidad facilitar el proceso de préstamo y devolución de materiales en la caseta del edificio Pesado 1, así como permitir a los estudiantes consultar su historial de uso, visualizar herramientas disponibles y recibir notificaciones relacionadas con su cuenta.' },
//     { type: 'heading', text: '2. Acceso y Uso Autorizado' },
//     { type: 'paragraph', text: 'El uso de esta aplicación está destinado exclusivamente a estudiantes activos de la Universidad Tecnológica de Durango, quienes hayan sido previamente registrados por el personal administrativo en el sistema.' },
//     { type: 'heading', text: '3. Compromisos del Usuario' },
//     { type: 'paragraph', text: 'El usuario se compromete a:' },
//     { type: 'listItem', text: 'Utilizar la aplicación únicamente para los fines establecidos por la institución.' },
//     { type: 'listItem', text: 'Proporcionar información verídica y actualizada.' },
//     { type: 'listItem', text: 'Mantener la confidencialidad de sus credenciales de acceso.' },
//     { type: 'listItem', text: 'Cumplir con los plazos de devolución establecidos.' },
//     { type: 'heading', text: '4. Uso Indebido y Sanciones' },
//     { type: 'paragraph', text: 'El uso indebido de la aplicación, como el acceso no autorizado o la manipulación del sistema, puede derivar en el bloqueo del acceso y en sanciones conforme al reglamento interno de la universidad.' },
//     { type: 'heading', text: '5. Limitación de Responsabilidad' },
//     { type: 'paragraph', text: 'La institución no se hace responsable por interrupciones del servicio debidas a factores externos fuera de su control (ej. conectividad del dispositivo).' },
//     { type: 'heading', text: '6. Propiedad Intelectual' },
//     { type: 'paragraph', text: 'El sistema y sus contenidos son propiedad de la Universidad Tecnológica de Durango. Queda prohibida su reproducción o distribución sin autorización.' },
//     { type: 'heading', text: '7. Aceptación' },
//     { type: 'paragraph', text: 'Al utilizar esta aplicación, el usuario declara haber leído, entendido y aceptado los presentes Términos y Condiciones en su totalidad.' },
// ];

// export default function LoginScreen() {
//     const router = useRouter();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);

//     const [alertVisible, setAlertVisible] = useState(false);
//     const [alertTitle, setAlertTitle] = useState('');
//     const [alertMessage, setAlertMessage] = useState('');

//     const [isPolicyVisible, setPolicyVisible] = useState(false);
//     const [isTermsVisible, setTermsVisible] = useState(false);

//     const handleLogin = () => {
//         if (email === 'paulina_3141230012@utd.edu.mx' && password === '123456789') {
//             router.replace('/(tabs)');
//         } else {
//             setAlertTitle('Error de Autenticación');
//             setAlertMessage('El correo o la contraseña que ingresaste son incorrectos. Por favor, inténtalo de nuevo.');
//             setAlertVisible(true);
//         }
//     };

//     const handleCloseAlert = () => {
//         setAlertVisible(false);
//     };

//     return (
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={styles.container}>
//                 <ImageBackground source={BackgroundImage} style={styles.backgroundImage} />
                
//                 <View style={styles.contentContainer}>
//                     <View style={styles.headerContainer}>
//                         <Image source={LogoImage} style={styles.logo} />
//                         <Text style={styles.title}>Tools</Text>
//                         <Text style={styles.subtitle}>Plataforma Educativa</Text>
//                     </View>

//                     <View style={styles.formContainer}>
//                         <Text style={styles.label}>Correo Institucional</Text>
//                         <View style={styles.inputContainer}>
//                             <Feather name="mail" size={20} color="#666" style={styles.icon} />
//                             <TextInput style={styles.input} placeholder="nombre@utd.edu.mx" placeholderTextColor="#aaa" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
//                         </View>
//                         <Text style={styles.label}>Contraseña</Text>
//                         <View style={styles.inputContainer}>
//                             <Feather name="lock" size={20} color="#666" style={styles.icon} />
//                             <TextInput style={styles.input} placeholder="••••••••••" placeholderTextColor="#aaa" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
//                             <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                                 <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#888" style={styles.icon} />
//                             </TouchableOpacity>
//                         </View>
//                         <TouchableOpacity style={styles.button} onPress={handleLogin}>
//                             <Text style={styles.buttonText}>Iniciar Sesión</Text>
//                         </TouchableOpacity>
//                         <Link href="/forgot-password" asChild>
//                             <TouchableOpacity>
//                                 <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
//                             </TouchableOpacity>
//                         </Link>
//                         <View style={styles.registerContainer}>
//                             <Text style={styles.registerText}>¿No tienes cuenta? </Text>
//                             <Link href="/register" asChild>
//                                 <TouchableOpacity>
//                                     <Text style={styles.registerLinkText}>Regístrate</Text>
//                                 </TouchableOpacity>
//                             </Link>
//                         </View>
                        
//                         {/* --- CAMBIO: Separador y botón de Google eliminados --- */}

//                         <View style={styles.footer}>
//                             <Text style={styles.footerText}>© 2025 UTD Tools - Plataforma Educativa</Text>
//                             <View style={styles.linksContainer}>
//                                 <TouchableOpacity onPress={() => setTermsVisible(true)}>
//                                     <Text style={styles.privacyText}>Términos y Condiciones</Text>
//                                 </TouchableOpacity>
//                                 <Text style={styles.separator}>|</Text>
//                                 <TouchableOpacity onPress={() => setPolicyVisible(true)}>
//                                     <Text style={styles.privacyText}>Políticas de Privacidad</Text>
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                     </View>
//                 </View>

//                 <CustomAlert
//                     visible={alertVisible}
//                     title={alertTitle}
//                     message={alertMessage}
//                     onClose={handleCloseAlert}
//                     type="error"
//                 />
//                 <PolicyModal
//                     visible={isPolicyVisible}
//                     onClose={() => setPolicyVisible(false)}
//                     title="Políticas de Privacidad"
//                     content={privacyPolicyContent}
//                 />
//                 <PolicyModal
//                     visible={isTermsVisible}
//                     onClose={() => setTermsVisible(false)}
//                     title="Términos y Condiciones de Uso"
//                     content={termsOfServiceContent}
//                 />
//             </View>
//         </TouchableWithoutFeedback>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, },
//     backgroundImage: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, width: '100%', height: '100%', },
//     contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, },
//     headerContainer: { alignItems: 'center', marginBottom: 20, },
//     logo: { width: 180, height: 90, resizeMode: 'contain', marginBottom: 5, },
//     title: { fontSize: 36, fontWeight: 'bold', color: '#333', },
//     subtitle: { fontSize: 16, color: '#555', marginBottom: 20, },
//     formContainer: { width: '100%', backgroundColor: 'white', padding: 25, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8, },
//     label: { fontSize: 16, color: '#444', marginBottom: 8, fontWeight: '500', },
//     inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee', },
//     icon: { marginRight: 10, },
//     input: { flex: 1, height: 50, fontSize: 16, color: '#333', },
//     button: { backgroundColor: '#17A67D', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 10, },
//     buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', },
//     forgotPasswordText: { color: '#555', textAlign: 'center', fontSize: 14, fontWeight: '500', marginTop: 20, },
//     registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, },
//     registerText: { fontSize: 16, color: '#555', },
//     registerLinkText: { fontSize: 16, fontWeight: 'bold', color: '#17A67D', },
//     // --- CAMBIO: Estilos del botón de Google eliminados ---
//     footer: { marginTop: 25, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center', },
//     footerText: { color: 'gray', fontSize: 12, },
//     linksContainer: {
//         flexDirection: 'row',
//         marginTop: 4,
//     },
//     privacyText: { color: '#17A67D', fontSize: 12, fontWeight: '600', textDecorationLine: 'underline', },
//     separator: {
//         color: 'gray',
//         fontSize: 12,
//         marginHorizontal: 5,
//     },
// });


// app/(auth)/index.tsx
// import { Feather } from '@expo/vector-icons';
// import { Link, useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import {
//     Image,
//     ImageBackground,
//     Keyboard,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     TouchableWithoutFeedback,
//     View,
//     ActivityIndicator
// } from 'react-native';
// import CustomAlert from '../../components/CustomAlert';
// import PolicyModal from '../../components/PolicyModal';
// import AuthService from '../../services/authService';

// import BackgroundImage from '../../assets/images/fondito.png';
// import LogoImage from '../../assets/images/utd.png';

// // --- Textos de políticas y términos con estructura ---
// const privacyPolicyContent = [
//   { type: 'paragraph', text: 'Última Actualización: 14 de julio de 2025.' },
//   { type: 'paragraph', text: 'La presente Política de Privacidad tiene como finalidad informar a los usuarios sobre el tratamiento de sus datos personales al utilizar la aplicación móvil "UTD Tools", desarrollada por la Universidad Tecnológica de Durango. Su privacidad y la seguridad de su información son de máxima importancia para nosotros.' },
//   { type: 'heading', text: '1. Datos Recopilados' },
//   { type: 'paragraph', text: 'Con fines estrictamente académicos y administrativos, la aplicación recopila la siguiente información:' },
//   { type: 'listItem', text: 'Nombre completo del usuario.' },
//   { type: 'listItem', text: 'Matrícula institucional.' },
//   { type: 'listItem', text: 'Carrera y cuatrimestre.' },
//   { type: 'listItem', text: 'Correo electrónico institucional.' },
//   { type: 'listItem', text: 'Historial de préstamos y devoluciones de herramientas.' },
//   { type: 'listItem', text: 'Datos biométricos: Utilizados exclusivamente para autenticación. La aplicación no almacena imágenes ni representaciones de la huella.' },
//   { type: 'heading', text: '2. Uso de la Información' },
//   { type: 'paragraph', text: 'La información recopilada se utiliza única y exclusivamente para los siguientes propósitos:' },
//   { type: 'listItem', text: 'Validar la identidad del estudiante.' },
//   { type: 'listItem', text: 'Registrar y consultar movimientos en el sistema.' },
//   { type: 'listItem', text: 'Generar reportes institucionales de uso.' },
//   { type: 'listItem', text: 'Enviar notificaciones relevantes sobre su cuenta.' },
//   { type: 'heading', text: '3. Almacenamiento y Seguridad' },
//   { type: 'paragraph', text: 'La información se almacena de forma segura en una base de datos en la nube (MongoDB Atlas), implementando protocolos de encriptación. La autenticación biométrica se gestiona a través de una API externa segura que procesa la validación sin almacenar datos biométricos en la aplicación móvil.' },
//   { type: 'heading', text: '4. Divulgación de Información' },
//   { type: 'paragraph', text: 'La Universidad Tecnológica de Durango se compromete a no compartir, vender o divulgar datos personales de los usuarios con terceros, salvo requerimiento legal expreso de una autoridad competente.' },
//   { type: 'heading', text: '5. Consentimiento' },
//   { type: 'paragraph', text: 'El uso de esta aplicación implica la aceptación expresa de esta Política de Privacidad y el consentimiento para el tratamiento de sus datos personales conforme a lo aquí descrito.' },
// ];

// const termsOfServiceContent = [
//     { type: 'paragraph', text: 'Última Actualización: 14 de julio de 2025.' },
//     { type: 'paragraph', text: 'Estos Términos y Condiciones regulan el uso de la aplicación móvil del Sistema de Control de Caseta del Edificio Pesado 1 de la Universidad Tecnológica de Durango. Al acceder y utilizar esta aplicación, el usuario acepta y se compromete a cumplir con las disposiciones aquí establecidas.'},
//     { type: 'heading', text: '1. Objeto de la Aplicación' },
//     { type: 'paragraph', text: 'La presente aplicación móvil tiene como finalidad facilitar el proceso de préstamo y devolución de materiales en la caseta del edificio Pesado 1, así como permitir a los estudiantes consultar su historial de uso, visualizar herramientas disponibles y recibir notificaciones relacionadas con su cuenta.' },
//     { type: 'heading', text: '2. Acceso y Uso Autorizado' },
//     { type: 'paragraph', text: 'El uso de esta aplicación está destinado exclusivamente a estudiantes activos de la Universidad Tecnológica de Durango, quienes hayan sido previamente registrados por el personal administrativo en el sistema.' },
//     { type: 'heading', text: '3. Compromisos del Usuario' },
//     { type: 'paragraph', text: 'El usuario se compromete a:' },
//     { type: 'listItem', text: 'Utilizar la aplicación únicamente para los fines establecidos por la institución.' },
//     { type: 'listItem', text: 'Proporcionar información verídica y actualizada.' },
//     { type: 'listItem', text: 'Mantener la confidencialidad de sus credenciales de acceso.' },
//     { type: 'listItem', text: 'Cumplir con los plazos de devolución establecidos.' },
//     { type: 'heading', text: '4. Uso Indebido y Sanciones' },
//     { type: 'paragraph', text: 'El uso indebido de la aplicación, como el acceso no autorizado o la manipulación del sistema, puede derivar en el bloqueo del acceso y en sanciones conforme al reglamento interno de la universidad.' },
//     { type: 'heading', text: '5. Limitación de Responsabilidad' },
//     { type: 'paragraph', text: 'La institución no se hace responsable por interrupciones del servicio debidas a factores externos fuera de su control (ej. conectividad del dispositivo).' },
//     { type: 'heading', text: '6. Propiedad Intelectual' },
//     { type: 'paragraph', text: 'El sistema y sus contenidos son propiedad de la Universidad Tecnológica de Durango. Queda prohibida su reproducción o distribución sin autorización.' },
//     { type: 'heading', text: '7. Aceptación' },
//     { type: 'paragraph', text: 'Al utilizar esta aplicación, el usuario declara haber leído, entendido y aceptado los presentes Términos y Condiciones en su totalidad.' },
// ];

// export default function LoginScreen() {
//     const router = useRouter();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);

//     const [alertVisible, setAlertVisible] = useState(false);
//     const [alertTitle, setAlertTitle] = useState('');
//     const [alertMessage, setAlertMessage] = useState('');
//     const [alertType, setAlertType] = useState<'success' | 'error'>('error');

//     const [isPolicyVisible, setPolicyVisible] = useState(false);
//     const [isTermsVisible, setTermsVisible] = useState(false);

//     const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
//         setAlertTitle(title);
//         setAlertMessage(message);
//         setAlertType(type);
//         setAlertVisible(true);
//     };

//     const handleLogin = async () => {
//         // Validaciones básicas
//         if (!email.trim() || !password.trim()) {
//             showAlert('Campos Requeridos', 'Por favor ingresa tu correo y contraseña.');
//             return;
//         }

//         // Validar formato de email institucional
//         if (!email.toLowerCase().endsWith('@utd.edu.mx')) {
//             showAlert('Correo Inválido', 'Debes usar tu correo institucional (@utd.edu.mx).');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             console.log('Intentando login con:', email);
            
//             const response = await AuthService.login({
//                 email: email.toLowerCase().trim(),
//                 password: password.trim()
//             });

//             console.log('Respuesta del login:', response);

//             if (response.success && response.student) {
//                 // Login exitoso
//                 showAlert('Bienvenido', `Hola ${response.student.full_name || 'Estudiante'}`, 'success');
                
//                 // Navegar a la app después de un momento
//                 setTimeout(() => {
//                     router.replace('/(tabs)');
//                 }, 1500);
//             } else {
//                 showAlert('Error de Login', response.message || 'Error desconocido');
//             }

//         } catch (error: any) {
//             console.error('Error en login:', error);
            
//             let errorMessage = 'Error de conexión. Verifica tu internet.';
            
//             if (error.message) {
//                 if (error.message.includes('Credenciales incorrectas')) {
//                     errorMessage = 'Correo o contraseña incorrectos.';
//                 } else if (error.message.includes('bloqueada')) {
//                     errorMessage = 'Tu cuenta está bloqueada. Contacta al administrador.';
//                 } else {
//                     errorMessage = error.message;
//                 }
//             }
            
//             showAlert('Error de Autenticación', errorMessage);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleCloseAlert = () => {
//         setAlertVisible(false);
//     };

//     return (
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={styles.container}>
//                 <ImageBackground source={BackgroundImage} style={styles.backgroundImage} />
                
//                 <View style={styles.contentContainer}>
//                     <View style={styles.headerContainer}>
//                         <Image source={LogoImage} style={styles.logo} />
//                         <Text style={styles.title}>Tools</Text>
//                         <Text style={styles.subtitle}>Plataforma Educativa</Text>
//                     </View>

//                     <View style={styles.formContainer}>
//                         <Text style={styles.label}>Correo Institucional</Text>
//                         <View style={styles.inputContainer}>
//                             <Feather name="mail" size={20} color="#666" style={styles.icon} />
//                             <TextInput 
//                                 style={styles.input} 
//                                 placeholder="nombre@utd.edu.mx" 
//                                 placeholderTextColor="#aaa" 
//                                 keyboardType="email-address" 
//                                 autoCapitalize="none" 
//                                 value={email} 
//                                 onChangeText={setEmail}
//                                 editable={!isLoading}
//                             />
//                         </View>
                        
//                         <Text style={styles.label}>Contraseña</Text>
//                         <View style={styles.inputContainer}>
//                             <Feather name="lock" size={20} color="#666" style={styles.icon} />
//                             <TextInput 
//                                 style={styles.input} 
//                                 placeholder="••••••••••" 
//                                 placeholderTextColor="#aaa" 
//                                 secureTextEntry={!showPassword} 
//                                 value={password} 
//                                 onChangeText={setPassword}
//                                 editable={!isLoading}
//                             />
//                             <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
//                                 <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#888" style={styles.icon} />
//                             </TouchableOpacity>
//                         </View>
                        
//                         <TouchableOpacity 
//                             style={[styles.button, isLoading && styles.buttonDisabled]} 
//                             onPress={handleLogin}
//                             disabled={isLoading}
//                         >
//                             {isLoading ? (
//                                 <ActivityIndicator color="white" size="small" />
//                             ) : (
//                                 <Text style={styles.buttonText}>Iniciar Sesión</Text>
//                             )}
//                         </TouchableOpacity>
                        
//                         <Link href="/forgot-password" asChild>
//                             <TouchableOpacity disabled={isLoading}>
//                                 <Text style={[styles.forgotPasswordText, isLoading && styles.textDisabled]}>¿Olvidaste tu contraseña?</Text>
//                             </TouchableOpacity>
//                         </Link>
                        
//                         <View style={styles.registerContainer}>
//                             <Text style={[styles.registerText, isLoading && styles.textDisabled]}>¿No tienes cuenta? </Text>
//                             <Link href="/register" asChild>
//                                 <TouchableOpacity disabled={isLoading}>
//                                     <Text style={[styles.registerLinkText, isLoading && styles.textDisabled]}>Regístrate</Text>
//                                 </TouchableOpacity>
//                             </Link>
//                         </View>

//                         <View style={styles.footer}>
//                             <Text style={styles.footerText}>© 2025 UTD Tools - Plataforma Educativa</Text>
//                             <View style={styles.linksContainer}>
//                                 <TouchableOpacity onPress={() => setTermsVisible(true)} disabled={isLoading}>
//                                     <Text style={[styles.privacyText, isLoading && styles.textDisabled]}>Términos y Condiciones</Text>
//                                 </TouchableOpacity>
//                                 <Text style={styles.separator}>|</Text>
//                                 <TouchableOpacity onPress={() => setPolicyVisible(true)} disabled={isLoading}>
//                                     <Text style={[styles.privacyText, isLoading && styles.textDisabled]}>Políticas de Privacidad</Text>
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                     </View>
//                 </View>

//                 <CustomAlert
//                     visible={alertVisible}
//                     title={alertTitle}
//                     message={alertMessage}
//                     onClose={handleCloseAlert}
//                     type={alertType}
//                 />
//                 <PolicyModal
//                     visible={isPolicyVisible}
//                     onClose={() => setPolicyVisible(false)}
//                     title="Políticas de Privacidad"
//                     content={privacyPolicyContent}
//                 />
//                 <PolicyModal
//                     visible={isTermsVisible}
//                     onClose={() => setTermsVisible(false)}
//                     title="Términos y Condiciones de Uso"
//                     content={termsOfServiceContent}
//                 />
//             </View>
//         </TouchableWithoutFeedback>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, },
//     backgroundImage: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, width: '100%', height: '100%', },
//     contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, },
//     headerContainer: { alignItems: 'center', marginBottom: 20, },
//     logo: { width: 180, height: 90, resizeMode: 'contain', marginBottom: 5, },
//     title: { fontSize: 36, fontWeight: 'bold', color: '#333', },
//     subtitle: { fontSize: 16, color: '#555', marginBottom: 20, },
//     formContainer: { width: '100%', backgroundColor: 'white', padding: 25, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8, },
//     label: { fontSize: 16, color: '#444', marginBottom: 8, fontWeight: '500', },
//     inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee', },
//     icon: { marginRight: 10, },
//     input: { flex: 1, height: 50, fontSize: 16, color: '#333', },
//     button: { backgroundColor: '#17A67D', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 10, },
//     buttonDisabled: { backgroundColor: '#ccc', },
//     buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', },
//     forgotPasswordText: { color: '#555', textAlign: 'center', fontSize: 14, fontWeight: '500', marginTop: 20, },
//     registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, },
//     registerText: { fontSize: 16, color: '#555', },
//     registerLinkText: { fontSize: 16, fontWeight: 'bold', color: '#17A67D', },
//     textDisabled: { color: '#ccc', },
//     footer: { marginTop: 25, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center', },
//     footerText: { color: 'gray', fontSize: 12, },
//     linksContainer: {
//         flexDirection: 'row',
//         marginTop: 4,
//     },
//     privacyText: { color: '#17A67D', fontSize: 12, fontWeight: '600', textDecorationLine: 'underline', },
//     separator: {
//         color: 'gray',
//         fontSize: 12,
//         marginHorizontal: 5,
//     },
// });


// app/(auth)/index.tsx
import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ImageBackground,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ActivityIndicator
} from 'react-native';
import CustomAlert from '../../components/CustomAlert';
import PolicyModal from '../../components/PolicyModal';
import AuthService from '../../services/authService';
import { useUser } from '../../context/UserContext';

import BackgroundImage from '../../assets/images/fondito.png';
import LogoImage from '../../assets/images/utd.png';

// --- Textos de políticas y términos con estructura ---
const privacyPolicyContent = [
  { type: 'paragraph', text: 'Última Actualización: 14 de julio de 2025.' },
  { type: 'paragraph', text: 'La presente Política de Privacidad tiene como finalidad informar a los usuarios sobre el tratamiento de sus datos personales al utilizar la aplicación móvil "UTD Tools", desarrollada por la Universidad Tecnológica de Durango. Su privacidad y la seguridad de su información son de máxima importancia para nosotros.' },
  { type: 'heading', text: '1. Datos Recopilados' },
  { type: 'paragraph', text: 'Con fines estrictamente académicos y administrativos, la aplicación recopila la siguiente información:' },
  { type: 'listItem', text: 'Nombre completo del usuario.' },
  { type: 'listItem', text: 'Matrícula institucional.' },
  { type: 'listItem', text: 'Carrera y cuatrimestre.' },
  { type: 'listItem', text: 'Correo electrónico institucional.' },
  { type: 'listItem', text: 'Historial de préstamos y devoluciones de herramientas.' },
  { type: 'listItem', text: 'Datos biométricos: Utilizados exclusivamente para autenticación. La aplicación no almacena imágenes ni representaciones de la huella.' },
  { type: 'heading', text: '2. Uso de la Información' },
  { type: 'paragraph', text: 'La información recopilada se utiliza única y exclusivamente para los siguientes propósitos:' },
  { type: 'listItem', text: 'Validar la identidad del estudiante.' },
  { type: 'listItem', text: 'Registrar y consultar movimientos en el sistema.' },
  { type: 'listItem', text: 'Generar reportes institucionales de uso.' },
  { type: 'listItem', text: 'Enviar notificaciones relevantes sobre su cuenta.' },
  { type: 'heading', text: '3. Almacenamiento y Seguridad' },
  { type: 'paragraph', text: 'La información se almacena de forma segura en una base de datos en la nube (MongoDB Atlas), implementando protocolos de encriptación. La autenticación biométrica se gestiona a través de una API externa segura que procesa la validación sin almacenar datos biométricos en la aplicación móvil.' },
  { type: 'heading', text: '4. Divulgación de Información' },
  { type: 'paragraph', text: 'La Universidad Tecnológica de Durango se compromete a no compartir, vender o divulgar datos personales de los usuarios con terceros, salvo requerimiento legal expreso de una autoridad competente.' },
  { type: 'heading', text: '5. Consentimiento' },
  { type: 'paragraph', text: 'El uso de esta aplicación implica la aceptación expresa de esta Política de Privacidad y el consentimiento para el tratamiento de sus datos personales conforme a lo aquí descrito.' },
];

const termsOfServiceContent = [
    { type: 'paragraph', text: 'Última Actualización: 14 de julio de 2025.' },
    { type: 'paragraph', text: 'Estos Términos y Condiciones regulan el uso de la aplicación móvil del Sistema de Control de Caseta del Edificio Pesado 1 de la Universidad Tecnológica de Durango. Al acceder y utilizar esta aplicación, el usuario acepta y se compromete a cumplir con las disposiciones aquí establecidas.'},
    { type: 'heading', text: '1. Objeto de la Aplicación' },
    { type: 'paragraph', text: 'La presente aplicación móvil tiene como finalidad facilitar el proceso de préstamo y devolución de materiales en la caseta del edificio Pesado 1, así como permitir a los estudiantes consultar su historial de uso, visualizar herramientas disponibles y recibir notificaciones relacionadas con su cuenta.' },
    { type: 'heading', text: '2. Acceso y Uso Autorizado' },
    { type: 'paragraph', text: 'El uso de esta aplicación está destinado exclusivamente a estudiantes activos de la Universidad Tecnológica de Durango, quienes hayan sido previamente registrados por el personal administrativo en el sistema.' },
    { type: 'heading', text: '3. Compromisos del Usuario' },
    { type: 'paragraph', text: 'El usuario se compromete a:' },
    { type: 'listItem', text: 'Utilizar la aplicación únicamente para los fines establecidos por la institución.' },
    { type: 'listItem', text: 'Proporcionar información verídica y actualizada.' },
    { type: 'listItem', text: 'Mantener la confidencialidad de sus credenciales de acceso.' },
    { type: 'listItem', text: 'Cumplir con los plazos de devolución establecidos.' },
    { type: 'heading', text: '4. Uso Indebido y Sanciones' },
    { type: 'paragraph', text: 'El uso indebido de la aplicación, como el acceso no autorizado o la manipulación del sistema, puede derivar en el bloqueo del acceso y en sanciones conforme al reglamento interno de la universidad.' },
    { type: 'heading', text: '5. Limitación de Responsabilidad' },
    { type: 'paragraph', text: 'La institución no se hace responsable por interrupciones del servicio debidas a factores externos fuera de su control (ej. conectividad del dispositivo).' },
    { type: 'heading', text: '6. Propiedad Intelectual' },
    { type: 'paragraph', text: 'El sistema y sus contenidos son propiedad de la Universidad Tecnológica de Durango. Queda prohibida su reproducción o distribución sin autorización.' },
    { type: 'heading', text: '7. Aceptación' },
    { type: 'paragraph', text: 'Al utilizar esta aplicación, el usuario declara haber leído, entendido y aceptado los presentes Términos y Condiciones en su totalidad.' },
];

export default function LoginScreen() {
    const router = useRouter();
    const { setUser } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('error');

    const [isPolicyVisible, setPolicyVisible] = useState(false);
    const [isTermsVisible, setTermsVisible] = useState(false);

    const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertType(type);
        setAlertVisible(true);
    };

    const handleLogin = async () => {
        // Validaciones básicas
        if (!email.trim() || !password.trim()) {
            showAlert('Campos Requeridos', 'Por favor ingresa tu correo y contraseña.');
            return;
        }

        // Validar formato de email institucional
        if (!email.toLowerCase().endsWith('@utd.edu.mx')) {
            showAlert('Correo Inválido', 'Debes usar tu correo institucional (@utd.edu.mx).');
            return;
        }

        setIsLoading(true);

        try {
            console.log('Intentando login con:', email);
            
            const response = await AuthService.login({
                email: email.toLowerCase().trim(),
                password: password.trim()
            });

            console.log('Respuesta del login:', response);

            if (response.success && response.student) {
                // Guardar usuario en el contexto global
                await setUser(response.student);
                
                console.log('Usuario guardado en contexto:', response.student.full_name);
                
                // Login exitoso
                showAlert('Bienvenido', `Hola ${response.student.full_name || 'Estudiante'}`, 'success');
                
                // Navegar a la app después de un momento
                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 1500);
            } else {
                showAlert('Error de Login', response.message || 'Error desconocido');
            }

        } catch (error: any) {
            console.error('Error en login:', error);
            
            let errorMessage = 'Error de conexión. Verifica tu internet.';
            
            if (error.message) {
                if (error.message.includes('Credenciales incorrectas')) {
                    errorMessage = 'Correo o contraseña incorrectos.';
                } else if (error.message.includes('bloqueada')) {
                    errorMessage = 'Tu cuenta está bloqueada. Contacta al administrador.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            showAlert('Error de Autenticación', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseAlert = () => {
        setAlertVisible(false);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <ImageBackground source={BackgroundImage} style={styles.backgroundImage} />
                
                <View style={styles.contentContainer}>
                    <View style={styles.headerContainer}>
                        <Image source={LogoImage} style={styles.logo} />
                        <Text style={styles.title}>Tools</Text>
                        <Text style={styles.subtitle}>Plataforma Educativa</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Correo Institucional</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="mail" size={20} color="#666" style={styles.icon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="nombre@utd.edu.mx" 
                                placeholderTextColor="#aaa" 
                                keyboardType="email-address" 
                                autoCapitalize="none" 
                                value={email} 
                                onChangeText={setEmail}
                                editable={!isLoading}
                            />
                        </View>
                        
                        <Text style={styles.label}>Contraseña</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="lock" size={20} color="#666" style={styles.icon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="••••••••••" 
                                placeholderTextColor="#aaa" 
                                secureTextEntry={!showPassword} 
                                value={password} 
                                onChangeText={setPassword}
                                editable={!isLoading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#888" style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity 
                            style={[styles.button, isLoading && styles.buttonDisabled]} 
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.buttonText}>Iniciar Sesión</Text>
                            )}
                        </TouchableOpacity>
                        
                        <Link href="/forgot-password" asChild>
                            <TouchableOpacity disabled={isLoading}>
                                <Text style={[styles.forgotPasswordText, isLoading && styles.textDisabled]}>¿Olvidaste tu contraseña?</Text>
                            </TouchableOpacity>
                        </Link>
                        
                        <View style={styles.registerContainer}>
                            <Text style={[styles.registerText, isLoading && styles.textDisabled]}>¿No tienes cuenta? </Text>
                            <Link href="/register" asChild>
                                <TouchableOpacity disabled={isLoading}>
                                    <Text style={[styles.registerLinkText, isLoading && styles.textDisabled]}>Regístrate</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>© 2025 UTD Tools - Plataforma Educativa</Text>
                            <View style={styles.linksContainer}>
                                <TouchableOpacity onPress={() => setTermsVisible(true)} disabled={isLoading}>
                                    <Text style={[styles.privacyText, isLoading && styles.textDisabled]}>Términos y Condiciones</Text>
                                </TouchableOpacity>
                                <Text style={styles.separator}>|</Text>
                                <TouchableOpacity onPress={() => setPolicyVisible(true)} disabled={isLoading}>
                                    <Text style={[styles.privacyText, isLoading && styles.textDisabled]}>Políticas de Privacidad</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                <CustomAlert
                    visible={alertVisible}
                    title={alertTitle}
                    message={alertMessage}
                    onClose={handleCloseAlert}
                    type={alertType}
                />
                <PolicyModal
                    visible={isPolicyVisible}
                    onClose={() => setPolicyVisible(false)}
                    title="Políticas de Privacidad"
                    content={privacyPolicyContent}
                />
                <PolicyModal
                    visible={isTermsVisible}
                    onClose={() => setTermsVisible(false)}
                    title="Términos y Condiciones de Uso"
                    content={termsOfServiceContent}
                />
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, },
    backgroundImage: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, width: '100%', height: '100%', },
    contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, },
    headerContainer: { alignItems: 'center', marginBottom: 20, },
    logo: { width: 180, height: 90, resizeMode: 'contain', marginBottom: 5, },
    title: { fontSize: 36, fontWeight: 'bold', color: '#333', },
    subtitle: { fontSize: 16, color: '#555', marginBottom: 20, },
    formContainer: { width: '100%', backgroundColor: 'white', padding: 25, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8, },
    label: { fontSize: 16, color: '#444', marginBottom: 8, fontWeight: '500', },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee', },
    icon: { marginRight: 10, },
    input: { flex: 1, height: 50, fontSize: 16, color: '#333', },
    button: { backgroundColor: '#17A67D', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 10, },
    buttonDisabled: { backgroundColor: '#ccc', },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', },
    forgotPasswordText: { color: '#555', textAlign: 'center', fontSize: 14, fontWeight: '500', marginTop: 20, },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, },
    registerText: { fontSize: 16, color: '#555', },
    registerLinkText: { fontSize: 16, fontWeight: 'bold', color: '#17A67D', },
    textDisabled: { color: '#ccc', },
    footer: { marginTop: 25, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center', },
    footerText: { color: 'gray', fontSize: 12, },
    linksContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    privacyText: { color: '#17A67D', fontSize: 12, fontWeight: '600', textDecorationLine: 'underline', },
    separator: {
        color: 'gray',
        fontSize: 12,
        marginHorizontal: 5,
    },
});