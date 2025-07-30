// // En: app/(auth)/register.tsx
// import { Feather } from '@expo/vector-icons';
// import { Link, useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import {
//     Image,
//     ImageBackground,
//     Keyboard,
//     ScrollView,
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

// export default function RegisterScreen() {
//     const router = useRouter();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [agreedToTerms, setAgreedToTerms] = useState(false);

//     const [alertVisible, setAlertVisible] = useState(false);
//     const [alertTitle, setAlertTitle] = useState('');
//     const [alertMessage, setAlertMessage] = useState('');
//     const [alertType, setAlertType] = useState<'success' | 'error'>('error');

//     const [isPolicyVisible, setPolicyVisible] = useState(false);
//     const [policyTitle, setPolicyTitle] = useState('');
//     const [policyContent, setPolicyContent] = useState<any[]>([]);

//     // --- CAMBIO: Lógica de validación restaurada ---
//     const handleRegister = () => {
//         if (!email || !password || !confirmPassword) {
//             setAlertTitle('Error');
//             setAlertMessage('Todos los campos son obligatorios.');
//             setAlertType('error');
//             setAlertVisible(true);
//             return;
//         }
//         if (!email.toLowerCase().endsWith('@utd.edu.mx')) {
//             setAlertTitle('Correo Inválido');
//             setAlertMessage('Solo se permite el registro con un correo institucional.');
//             setAlertType('error');
//             setAlertVisible(true);
//             return;
//         }
//         if (password.length < 8) {
//             setAlertTitle('Contraseña Débil');
//             setAlertMessage('Tu contraseña debe tener al menos 8 caracteres.');
//             setAlertType('error');
//             setAlertVisible(true);
//             return;
//         }
//         if (password !== confirmPassword) {
//             setAlertTitle('Error');
//             setAlertMessage('Las contraseñas no coinciden.');
//             setAlertType('error');
//             setAlertVisible(true);
//             return;
//         }
//         if (!agreedToTerms) {
//             setAlertTitle('Términos y Condiciones');
//             setAlertMessage('Debes aceptar los términos y políticas de privacidad para continuar.');
//             setAlertType('error');
//             setAlertVisible(true);
//             return;
//         }
        
//         // Si todas las validaciones pasan
//         setAlertTitle('¡Registro Exitoso!');
//         setAlertMessage('Tu cuenta ha sido creada. Ahora puedes iniciar sesión.');
//         setAlertType('success');
//         setAlertVisible(true);
//     };

//     const handleCloseAlert = () => {
//         setAlertVisible(false);
//         if (alertType === 'success') {
//             router.push('/(auth)');
//         }
//     };
    
//     const showTerms = () => {
//         setPolicyTitle('Términos y Condiciones de Uso');
//         setPolicyContent(termsOfServiceContent);
//         setPolicyVisible(true);
//     };

//     const showPrivacy = () => {
//         setPolicyTitle('Políticas de Privacidad');
//         setPolicyContent(privacyPolicyContent);
//         setPolicyVisible(true);
//     };

//     return (
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={styles.container}>
//                 <ImageBackground source={BackgroundImage} style={styles.backgroundImage} />
                
//                 <ScrollView contentContainerStyle={styles.scrollContainer}>
//                     <View style={styles.headerContainer}>
//                         <Image source={LogoImage} style={styles.logo} />
//                         <Text style={styles.title}>Crear Cuenta</Text>
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
//                             <TextInput style={styles.input} placeholder="Mínimo 8 caracteres" placeholderTextColor="#aaa" secureTextEntry={true} value={password} onChangeText={setPassword} />
//                         </View>
//                         <Text style={styles.label}>Confirmar Contraseña</Text>
//                         <View style={styles.inputContainer}>
//                             <Feather name="lock" size={20} color="#666" style={styles.icon} />
//                             <TextInput style={styles.input} placeholder="Confirma tu contraseña" placeholderTextColor="#aaa" secureTextEntry={true} value={confirmPassword} onChangeText={setConfirmPassword} />
//                         </View>
                        
//                         <View style={styles.termsContainer}>
//                             <TouchableOpacity onPress={() => setAgreedToTerms(!agreedToTerms)} style={styles.checkbox}>
//                                 <Feather name={agreedToTerms ? 'check-square' : 'square'} size={24} color={agreedToTerms ? '#17A67D' : '#888'} />
//                             </TouchableOpacity>
//                             <View style={{flexDirection: 'row', flexWrap: 'wrap', flex: 1}}>
//                                 <Text style={styles.termsText}>
//                                     Acepto los <Text onPress={showTerms} style={styles.linkText}>Términos y Condiciones</Text> y las <Text onPress={showPrivacy} style={styles.linkText}>Políticas de Privacidad</Text>.
//                                 </Text>
//                             </View>
//                         </View>

//                         <TouchableOpacity style={styles.button} onPress={handleRegister}>
//                             <Text style={styles.buttonText}>Registrarse</Text>
//                         </TouchableOpacity>
//                         <View style={styles.loginContainer}>
//                             <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
//                             <Link href="/(auth)" asChild>
//                                 <TouchableOpacity>
//                                     <Text style={styles.loginLinkText}>Inicia Sesión</Text>
//                                 </TouchableOpacity>
//                             </Link>
//                         </View>
//                     </View>
//                 </ScrollView>

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
//                     title={policyTitle}
//                     content={policyContent}
//                 />
//             </View>
//         </TouchableWithoutFeedback>
//     );
// }

// // ... (estilos sin cambios)
// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     backgroundImage: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
//     scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 30 },
//     headerContainer: { alignItems: 'center', marginBottom: 20 },
//     logo: { width: 150, height: 75, resizeMode: 'contain', marginBottom: 5 },
//     title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginTop: 10 },
//     formContainer: { width: '100%', backgroundColor: 'white', padding: 25, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
//     label: { fontSize: 16, color: '#444', marginBottom: 8, fontWeight: '500' },
//     inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', borderRadius: 10, marginBottom: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee' },
//     icon: { marginRight: 10 },
//     input: { flex: 1, height: 50, fontSize: 16, color: '#333' },
//     termsContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, },
//     checkbox: { marginRight: 10, marginTop: 2, },
//     termsText: { fontSize: 14, color: '#555', lineHeight: 20, },
//     linkText: { color: '#17A67D', fontWeight: 'bold', textDecorationLine: 'underline', },
//     button: { backgroundColor: '#17A67D', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
//     buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
//     loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 25 },
//     loginText: { fontSize: 16, color: '#555' },
//     loginLinkText: { fontSize: 16, fontWeight: 'bold', color: '#17A67D' },
// });
// app/(auth)/register.tsx
import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ImageBackground,
    Keyboard,
    ScrollView,
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
import RegisterService from '../../services/registerService';

import BackgroundImage from '../../assets/images/fondito.png';
import LogoImage from '../../assets/images/utd.png';

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

export default function RegisterScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('error');

    const [isPolicyVisible, setPolicyVisible] = useState(false);
    const [policyTitle, setPolicyTitle] = useState('');
    const [policyContent, setPolicyContent] = useState<any[]>([]);

    const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertType(type);
        setAlertVisible(true);
    };

    const handleRegister = async () => {
        // Validaciones de frontend
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            showAlert('Campos Requeridos', 'Todos los campos son obligatorios.');
            return;
        }

        if (!email.toLowerCase().endsWith('@utd.edu.mx')) {
            showAlert('Correo Inválido', 'Solo se permite el registro con un correo institucional (@utd.edu.mx).');
            return;
        }

        if (password.length < 8) {
            showAlert('Contraseña Débil', 'Tu contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Error de Contraseña', 'Las contraseñas no coinciden.');
            return;
        }

        if (!agreedToTerms) {
            showAlert('Términos y Condiciones', 'Debes aceptar los términos y políticas de privacidad para continuar.');
            return;
        }

        setIsLoading(true);

        try {
            console.log('Intentando registro con:', email);
            
            const response = await RegisterService.register({
                email: email.toLowerCase().trim(),
                password: password.trim()
            });

            console.log('Respuesta del registro:', response);

            if (response.success) {
                showAlert(
                    'Registro Exitoso', 
                    'Tu cuenta ha sido creada exitosamente. Tu perfil será completado por un administrador pronto. Ya puedes iniciar sesión.',
                    'success'
                );
            } else {
                showAlert('Error de Registro', response.message || 'Error desconocido en el registro');
            }

        } catch (error: any) {
            console.error('Error en registro:', error);
            
            let errorMessage = 'Error de conexión. Verifica tu internet.';
            
            if (error.message) {
                if (error.message.includes('Ya existe una cuenta')) {
                    errorMessage = 'Ya existe una cuenta con este correo electrónico.';
                } else if (error.message.includes('correo institucional')) {
                    errorMessage = 'Solo se permite el registro con correo institucional.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            showAlert('Error de Registro', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseAlert = () => {
        setAlertVisible(false);
        if (alertType === 'success') {
            // Redirigir al login después de registro exitoso
            router.push('/(auth)');
        }
    };
    
    const showTerms = () => {
        setPolicyTitle('Términos y Condiciones de Uso');
        setPolicyContent(termsOfServiceContent);
        setPolicyVisible(true);
    };

    const showPrivacy = () => {
        setPolicyTitle('Políticas de Privacidad');
        setPolicyContent(privacyPolicyContent);
        setPolicyVisible(true);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <ImageBackground source={BackgroundImage} style={styles.backgroundImage} />
                
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.headerContainer}>
                        <Image source={LogoImage} style={styles.logo} />
                        <Text style={styles.title}>Crear Cuenta</Text>
                        <Text style={styles.subtitle}>Registro de estudiantes UTD</Text>
                    </View>

                    <View style={styles.formContainer}>
                       

                        <Text style={styles.label}>Correo Institucional</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="mail" size={20} color="#666" style={styles.icon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="nombre_matricula@utd.edu.mx" 
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
                                placeholder="Mínimo 8 caracteres" 
                                placeholderTextColor="#aaa" 
                                secureTextEntry={true} 
                                value={password} 
                                onChangeText={setPassword}
                                editable={!isLoading}
                            />
                        </View>

                        <Text style={styles.label}>Confirmar Contraseña</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="lock" size={20} color="#666" style={styles.icon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Confirma tu contraseña" 
                                placeholderTextColor="#aaa" 
                                secureTextEntry={true} 
                                value={confirmPassword} 
                                onChangeText={setConfirmPassword}
                                editable={!isLoading}
                            />
                        </View>
                        
                        <View style={styles.termsContainer}>
                            <TouchableOpacity 
                                onPress={() => setAgreedToTerms(!agreedToTerms)} 
                                style={styles.checkbox}
                                disabled={isLoading}
                            >
                                <Feather 
                                    name={agreedToTerms ? 'check-square' : 'square'} 
                                    size={24} 
                                    color={agreedToTerms ? '#17A67D' : '#888'} 
                                />
                            </TouchableOpacity>
                            <View style={{flexDirection: 'row', flexWrap: 'wrap', flex: 1}}>
                                <Text style={[styles.termsText, isLoading && styles.textDisabled]}>
                                    Acepto los{' '}
                                    <Text 
                                        onPress={isLoading ? undefined : showTerms} 
                                        style={[styles.linkText, isLoading && styles.textDisabled]}
                                    >
                                        Términos y Condiciones
                                    </Text>
                                    {' '}y las{' '}
                                    <Text 
                                        onPress={isLoading ? undefined : showPrivacy} 
                                        style={[styles.linkText, isLoading && styles.textDisabled]}
                                    >
                                        Políticas de Privacidad
                                    </Text>
                                    .
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.button, isLoading && styles.buttonDisabled]} 
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.buttonText}>Crear Cuenta</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={[styles.loginText, isLoading && styles.textDisabled]}>¿Ya tienes una cuenta? </Text>
                            <Link href="/(auth)" asChild>
                                <TouchableOpacity disabled={isLoading}>
                                    <Text style={[styles.loginLinkText, isLoading && styles.textDisabled]}>Inicia Sesión</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>

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
                    title={policyTitle}
                    content={policyContent}
                />
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    backgroundImage: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 30 },
    headerContainer: { alignItems: 'center', marginBottom: 20 },
    logo: { width: 150, height: 75, resizeMode: 'contain', marginBottom: 5 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginTop: 10 },
    subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
    formContainer: { width: '100%', backgroundColor: 'white', padding: 25, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
    infoText: { 
        fontSize: 14, 
        color: '#17A67D', 
        textAlign: 'center', 
        marginBottom: 20, 
        backgroundColor: '#f0f9f6', 
        padding: 12, 
        borderRadius: 8,
        lineHeight: 18
    },
    label: { fontSize: 16, color: '#444', marginBottom: 8, fontWeight: '500' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', borderRadius: 10, marginBottom: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee' },
    icon: { marginRight: 10 },
    input: { flex: 1, height: 50, fontSize: 16, color: '#333' },
    termsContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    checkbox: { marginRight: 10, marginTop: 2 },
    termsText: { fontSize: 14, color: '#555', lineHeight: 20 },
    linkText: { color: '#17A67D', fontWeight: 'bold', textDecorationLine: 'underline' },
    textDisabled: { color: '#ccc' },
    button: { backgroundColor: '#17A67D', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
    buttonDisabled: { backgroundColor: '#ccc' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 25 },
    loginText: { fontSize: 16, color: '#555' },
    loginLinkText: { fontSize: 16, fontWeight: 'bold', color: '#17A67D' },
});