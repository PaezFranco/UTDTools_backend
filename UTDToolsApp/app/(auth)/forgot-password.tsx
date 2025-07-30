// // En: app/(auth)/forgot-password.tsx
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

// import BackgroundImage from '../../assets/images/fondito.png';
// import LogoImage from '../../assets/images/utd.png';

// // La clave es que la función del componente se exporte como 'default'.
// export default function ForgotPasswordScreen() {
//     const router = useRouter();
//     const [email, setEmail] = useState('');

//     const [alertVisible, setAlertVisible] = useState(false);

//     const handleRecovery = () => {
//         if (!email.toLowerCase().endsWith('@utd.edu.mx')) {
//             // Reutilizamos la alerta para el error
//             setAlertVisible(true);
//             return;
//         }

//         // Simulación de envío exitoso
//         router.push({ 
//             pathname: '/(auth)', 
//             params: { successMessage: 'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.' } 
//         });
//     };

//     return (
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={styles.container}>
//                 <ImageBackground source={BackgroundImage} style={styles.backgroundImage} />
                
//                 <ScrollView contentContainerStyle={styles.scrollContainer}>
//                     <View style={styles.headerContainer}>
//                         <Image source={LogoImage} style={styles.logo} />
//                         <Text style={styles.title}>Recuperar Contraseña</Text>
//                         <Text style={styles.subtitle}>Ingresa tu correo institucional para recibir las instrucciones.</Text>
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
//                             />
//                         </View>

//                         <TouchableOpacity style={styles.button} onPress={handleRecovery}>
//                             <Text style={styles.buttonText}>Enviar Instrucciones</Text>
//                         </TouchableOpacity>

//                         <View style={styles.loginContainer}>
//                             <Link href="/(auth)" asChild>
//                                 <TouchableOpacity>
//                                     <Text style={styles.loginLinkText}>Volver a Iniciar Sesión</Text>
//                                 </TouchableOpacity>
//                             </Link>
//                         </View>
//                     </View>
//                 </ScrollView>

//                 <CustomAlert
//                     visible={alertVisible}
//                     title="Correo Inválido"
//                     message="Por favor, ingresa un correo institucional válido."
//                     onClose={() => setAlertVisible(false)}
//                     type="error"
//                 />
//             </View>
//         </TouchableWithoutFeedback>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     backgroundImage: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
//     scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 30 },
//     headerContainer: { alignItems: 'center', marginBottom: 20, },
//     logo: { width: 150, height: 75, resizeMode: 'contain', marginBottom: 5 },
//     title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
//     subtitle: { fontSize: 16, color: '#555', marginVertical: 20, textAlign: 'center' },
//     formContainer: { width: '100%', backgroundColor: 'white', padding: 25, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
//     label: { fontSize: 16, color: '#444', marginBottom: 8, fontWeight: '500' },
//     inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', borderRadius: 10, marginBottom: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee' },
//     icon: { marginRight: 10 },
//     input: { flex: 1, height: 50, fontSize: 16, color: '#333' },
//     button: { backgroundColor: '#17A67D', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
//     buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
//     loginContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 25 },
//     loginLinkText: { fontSize: 16, fontWeight: 'bold', color: '#17A67D' },
// });

// app/(auth)/forgot-password.tsx
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
import PasswordRecoveryService from '../../services/passwordRecoveryService';

import BackgroundImage from '../../assets/images/fondito.png';
import LogoImage from '../../assets/images/utd.png';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('error');

    const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertType(type);
        setAlertVisible(true);
    };

    const handleRecovery = async () => {
        // Validaciones básicas
        if (!email.trim()) {
            showAlert('Campo Requerido', 'Por favor ingresa tu correo electrónico.');
            return;
        }

        if (!email.toLowerCase().endsWith('@utd.edu.mx')) {
            showAlert('Correo Inválido', 'Por favor, ingresa un correo institucional válido (@utd.edu.mx).');
            return;
        }

        setIsLoading(true);

        try {
            console.log('Solicitando recuperación para:', email);
            
            const response = await PasswordRecoveryService.forgotPassword(email.toLowerCase().trim());
            
            console.log('Respuesta de recuperación:', response);

            if (response.success) {
                showAlert(
                    'Solicitud Enviada',
                    'Si el correo está registrado, recibirás una nueva contraseña en tu correo electrónico. Revisa tu bandeja de entrada.',
                    'success'
                );
            } else {
                showAlert('Error', response.message || 'Error al procesar la solicitud');
            }

        } catch (error: any) {
            console.error('Error en recuperación:', error);
            
            let errorMessage = 'Error de conexión. Verifica tu internet.';
            
            if (error.message) {
                if (error.message.includes('correo institucional')) {
                    errorMessage = 'Debe ser un correo institucional válido.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            showAlert('Error de Recuperación', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseAlert = () => {
        setAlertVisible(false);
        if (alertType === 'success') {
            // Redirigir al login después de éxito
            router.push('/(auth)');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <ImageBackground source={BackgroundImage} style={styles.backgroundImage} />
                
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.headerContainer}>
                        <Image source={LogoImage} style={styles.logo} />
                        <Text style={styles.title}>Recuperar Contraseña</Text>
                        <Text style={styles.subtitle}>
                            Ingresa tu correo institucional para recibir una nueva contraseña.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.infoCard}>
                            <Feather name="info" size={20} color="#17A67D" />
                            <Text style={styles.infoText}>
                                Se enviará una nueva contraseña temporal a tu correo electrónico.
                            </Text>
                        </View>

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

                        <TouchableOpacity 
                            style={[styles.button, isLoading && styles.buttonDisabled]} 
                            onPress={handleRecovery}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.buttonText}>Enviar Nueva Contraseña</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.helpSection}>
                            <Text style={styles.helpTitle}>¿Necesitas ayuda?</Text>
                            <Text style={styles.helpText}>
                                • Verifica que sea tu correo institucional
                            </Text>
                            <Text style={styles.helpText}>
                                • Revisa tu bandeja de entrada y spam
                            </Text>
                            <Text style={styles.helpText}>
                                • Contacta al administrador si persisten los problemas
                            </Text>
                        </View>

                        <View style={styles.loginContainer}>
                            <Link href="/(auth)" asChild>
                                <TouchableOpacity disabled={isLoading}>
                                    <Text style={[styles.loginLinkText, isLoading && styles.textDisabled]}>
                                        ← Volver a Iniciar Sesión
                                    </Text>
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
    title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#555', marginVertical: 20, textAlign: 'center', lineHeight: 22 },
    formContainer: { width: '100%', backgroundColor: 'white', padding: 25, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0f9f6',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#17A67D'
    },
    infoText: {
        fontSize: 14,
        color: '#17A67D',
        marginLeft: 10,
        flex: 1,
        lineHeight: 18
    },
    label: { fontSize: 16, color: '#444', marginBottom: 8, fontWeight: '500' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', borderRadius: 10, marginBottom: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee' },
    icon: { marginRight: 10 },
    input: { flex: 1, height: 50, fontSize: 16, color: '#333' },
    button: { backgroundColor: '#17A67D', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
    buttonDisabled: { backgroundColor: '#ccc' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    textDisabled: { color: '#ccc' },
    helpSection: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        marginBottom: 10
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10
    },
    helpText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        lineHeight: 18
    },
    loginContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    loginLinkText: { fontSize: 16, fontWeight: 'bold', color: '#17A67D' },
});