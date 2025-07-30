// // En: app/(drawer)/(tabs)/perfil.tsx
// import { Feather } from '@expo/vector-icons';
// import { DrawerActions } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useNavigation } from 'expo-router';
// import React, { useState } from 'react';
// import {
//     KeyboardAvoidingView,
//     Platform,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View
// } from 'react-native';

// // --- Datos simulados del usuario ---
// const userData = {
//     name: 'Paulina Ale Breceda',
//     matricula: '3141230012',
//     initials: 'PB',
//     email: 'paulina_3141230012@utd.edu.mx',
//     phone: '6182933260',
//     career: 'TSU en Tecnologías de la Información',
//     semester: '5to Cuatrimestre',
//     group: 'B',
//     modality: 'Clásica',
//     biography: 'Apasionada por el desarrollo de software y la inteligencia artificial. Siempre buscando aprender nuevas tecnologías y aplicarlas en proyectos innovadores.',
// };

// // --- Componente para un item de información ---
// const InfoItem = ({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
//     <View style={styles.infoItem}>
//         <Feather name={icon} size={22} color={color} />
//         <View style={styles.infoTextContainer}>
//             <Text style={styles.infoLabel}>{label}</Text>
//             <Text style={styles.infoValue}>{value}</Text>
//         </View>
//     </View>
// );

// export default function PerfilScreen() {
//     const navigation = useNavigation();
//     const [isEditing, setIsEditing] = useState(false);
//     const [biography, setBiography] = useState(userData.biography);

//     const handleSave = () => {
//         // Aquí iría la lógica para guardar la biografía en la base de datos
//         console.log("Biografía guardada:", biography);
//         setIsEditing(false);
//     };

//     return (
//         <KeyboardAvoidingView 
//             style={{ flex: 1 }} 
//             behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//             <View style={styles.fullScreenContainer}>
//                 <LinearGradient
//                     colors={['#0A7360', '#17A67D']}
//                     style={styles.header}
//                 >
//                     <TouchableOpacity 
//                         style={styles.headerButton}
//                         onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
//                     >
//                         <Feather name="menu" size={24} color="white" />
//                     </TouchableOpacity>
//                     <Text style={styles.headerTitle}>Mi Perfil</Text>
//                     <View style={styles.headerButton} />
//                 </LinearGradient>

//                 <ScrollView contentContainerStyle={styles.scrollContent}>
//                     <View style={styles.profileCard}>
//                         <View style={styles.avatarContainer}>
//                             <Text style={styles.avatarText}>{userData.initials}</Text>
//                         </View>
//                         <Text style={styles.profileName}>{userData.name}</Text>
//                         <Text style={styles.profileMatricula}>{userData.matricula}</Text>
//                     </View>

//                     <View style={styles.infoCard}>
//                         <Text style={styles.cardTitle}>Información Académica y Contacto</Text>
//                         <InfoItem icon="mail" label="Correo Electrónico" value={userData.email} color="#17A67D" />
//                         <InfoItem icon="phone" label="Teléfono" value={userData.phone} color="#17A67D" />
//                         <InfoItem icon="book-open" label="Carrera" value={userData.career} color="#D9A404" />
//                         <InfoItem icon="calendar" label="Cuatrimestre" value={userData.semester} color="#D9A404" />
//                         <InfoItem icon="users" label="Grupo" value={userData.group} color="#D97C0B" />
//                         <InfoItem icon="layers" label="Modalidad" value={userData.modality} color="#D97C0B" />
//                     </View>

//                     <View style={styles.infoCard}>
//                         <View style={styles.bioHeader}>
//                             <Text style={styles.cardTitle}>Biografía</Text>
//                             <TouchableOpacity 
//                                 style={styles.editButton} 
//                                 onPress={() => isEditing ? handleSave() : setIsEditing(true)}
//                             >
//                                 <Feather name={isEditing ? "save" : "edit-2"} size={16} color="#17A67D" />
//                                 <Text style={styles.editButtonText}>{isEditing ? "Guardar" : "Editar"}</Text>
//                             </TouchableOpacity>
//                         </View>
//                         {isEditing ? (
//                             <TextInput
//                                 style={styles.bioInput}
//                                 value={biography}
//                                 onChangeText={setBiography}
//                                 multiline
//                                 autoFocus
//                             />
//                         ) : (
//                             <Text style={styles.bioText}>{biography}</Text>
//                         )}
//                     </View>
//                 </ScrollView>
//             </View>
//         </KeyboardAvoidingView>
//     );
// }

// const styles = StyleSheet.create({
//     fullScreenContainer: {
//         flex: 1,
//         backgroundColor: '#f4f7f9',
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingTop: 50,
//         paddingBottom: 15,
//         paddingHorizontal: 15,
//     },
//     headerButton: {
//         width: 40,
//         height: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     headerTitle: {
//         fontSize: 20,
//         fontFamily: 'Inter-Bold',
//         color: 'white',
//     },
//     scrollContent: {
//         padding: 20,
//     },
//     profileCard: {
//         backgroundColor: 'white',
//         borderRadius: 20,
//         padding: 30,
//         alignItems: 'center',
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 10,
//         elevation: 5,
//         marginBottom: 20,
//     },
//     avatarContainer: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         backgroundColor: '#D9A404',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     avatarText: {
//         fontFamily: 'Inter-Bold',
//         fontSize: 40,
//         color: 'white',
//     },
//     profileName: {
//         fontFamily: 'Inter-Bold',
//         fontSize: 22,
//         color: '#333',
//     },
//     profileMatricula: {
//         fontFamily: 'Inter-Regular',
//         fontSize: 16,
//         color: '#8E8E93',
//         marginTop: 4,
//     },
//     infoCard: {
//         backgroundColor: 'white',
//         borderRadius: 20,
//         padding: 25,
//         marginBottom: 20,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 10,
//         elevation: 5,
//     },
//     cardTitle: {
//         fontFamily: 'Inter-Bold',
//         fontSize: 18,
//         color: '#333',
//         marginBottom: 5, // Reducido para el nuevo layout
//     },
//     // --- CAMBIO: Estilos para la nueva lista de información ---
//     infoItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 12,
//         borderBottomWidth: 1,
//         borderBottomColor: '#f0f0f0',
//     },
//     infoTextContainer: {
//         marginLeft: 15,
//         flex: 1,
//     },
//     infoLabel: {
//         fontFamily: 'Inter-SemiBold',
//         fontSize: 14,
//         color: '#333',
//         marginBottom: 2,
//     },
//     infoValue: {
//         fontFamily: 'Inter-Regular',
//         fontSize: 14,
//         color: '#555',
//     },
//     // --- CAMBIO: Estilos para la tarjeta de biografía ---
//     bioHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 15,
//     },
//     editButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 8,
//         paddingHorizontal: 15,
//         borderRadius: 12,
//         borderWidth: 1.5,
//         borderColor: '#17A67D',
//     },
//     editButtonText: {
//         fontFamily: 'Inter-SemiBold',
//         fontSize: 14,
//         color: '#17A67D',
//         marginLeft: 8,
//     },
//     bioText: {
//         fontFamily: 'Inter-Regular',
//         fontSize: 15,
//         color: '#555',
//         lineHeight: 22,
//     },
//     bioInput: {
//         fontFamily: 'Inter-Regular',
//         fontSize: 15,
//         color: '#333',
//         lineHeight: 22,
//         backgroundColor: '#f4f7f9',
//         borderRadius: 10,
//         padding: 15,
//         minHeight: 120,
//         textAlignVertical: 'top',
//         borderWidth: 1,
//         borderColor: '#e2e8f0',
//     },
// });

// app/(drawer)/(tabs)/perfil.tsx
import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { useUser } from '../../../context/UserContext';

// Función para generar iniciales del nombre
const getInitials = (name: string): string => {
    if (!name) return 'NN';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// Función para formatear el cuatrimestre
const formatSemester = (semester: string | undefined): string => {
    if (!semester) return 'No definido';
    const num = parseInt(semester);
    if (isNaN(num)) return semester;
    return `${num}° Cuatrimestre`;
};

// Componente para un item de información
const InfoItem = ({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
    <View style={styles.infoItem}>
        <Feather name={icon} size={22} color={color} />
        <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

export default function PerfilScreen() {
    const navigation = useNavigation();
    const { user, logout } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [biography, setBiography] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulamos una carga y establecemos una biografía por defecto
        setTimeout(() => {
            if (user) {
                setBiography(
                    `Estudiante de ${user.career || 'la Universidad Tecnológica de Durango'}. ` +
                    `Comprometido con el aprendizaje y el desarrollo académico. ` +
                    `Siempre buscando nuevas oportunidades de crecimiento.`
                );
            }
            setIsLoading(false);
        }, 500);
    }, [user]);

    const handleSave = () => {
        // Aquí iría la lógica para guardar la biografía en la base de datos
        console.log("Biografía guardada:", biography);
        setIsEditing(false);
    };

    const handleLogout = async () => {
        await logout();
        // La navegación se manejará automáticamente por el AuthWrapper
    };

    if (!user || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#17A67D" />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    // Extraer datos del usuario
    const userName = user.full_name || user.email.split('@')[0];
    const userMatricula = user.student_id || 'Sin matrícula';
    const userEmail = user.email;
    const userPhone = user.phone || 'No especificado';
    const userCareer = user.career || 'No especificada';
    const userSemester = formatSemester(user.semester);
    const userGroup = user.group || 'No especificado';
    const initials = getInitials(userName);

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.fullScreenContainer}>
                <LinearGradient
                    colors={['#0A7360', '#17A67D']}
                    style={styles.header}
                >
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    >
                        <Feather name="menu" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={handleLogout}
                    >
                        <Feather name="log-out" size={24} color="white" />
                    </TouchableOpacity>
                </LinearGradient>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <Text style={styles.profileName}>{userName}</Text>
                        <Text style={styles.profileMatricula}>{userMatricula}</Text>
                        {user.is_mobile_registration_pending && (
                            <View style={styles.pendingBadge}>
                                <Text style={styles.pendingText}>Registro pendiente</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.cardTitle}>Información Académica y Contacto</Text>
                        <InfoItem icon="mail" label="Correo Electrónico" value={userEmail} color="#17A67D" />
                        <InfoItem icon="phone" label="Teléfono" value={userPhone} color="#17A67D" />
                        <InfoItem icon="book-open" label="Carrera" value={userCareer} color="#D9A404" />
                        <InfoItem icon="calendar" label="Cuatrimestre" value={userSemester} color="#D9A404" />
                        <InfoItem icon="users" label="Grupo" value={userGroup} color="#D97C0B" />
                        <InfoItem icon="layers" label="Modalidad" value="Clásica" color="#D97C0B" />
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.bioHeader}>
                            <Text style={styles.cardTitle}>Biografía</Text>
                            <TouchableOpacity 
                                style={styles.editButton} 
                                onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                            >
                                <Feather name={isEditing ? "save" : "edit-2"} size={16} color="#17A67D" />
                                <Text style={styles.editButtonText}>{isEditing ? "Guardar" : "Editar"}</Text>
                            </TouchableOpacity>
                        </View>
                        {isEditing ? (
                            <TextInput
                                style={styles.bioInput}
                                value={biography}
                                onChangeText={setBiography}
                                multiline
                                autoFocus
                                placeholder="Escribe algo sobre ti..."
                            />
                        ) : (
                            <Text style={styles.bioText}>{biography}</Text>
                        )}
                    </View>

                    {/* Información del estado de la cuenta */}
                    <View style={styles.infoCard}>
                        <Text style={styles.cardTitle}>Estado de la Cuenta</Text>
                        <InfoItem 
                            icon={user.is_profile_complete ? "check-circle" : "alert-circle"} 
                            label="Perfil Completo" 
                            value={user.is_profile_complete ? "Sí" : "No"} 
                            color={user.is_profile_complete ? "#17A67D" : "#D97C0B"} 
                        />
                        <InfoItem 
                            icon={user.registered_fingerprint ? "check-circle" : "x-circle"} 
                            label="Huella Registrada" 
                            value={user.registered_fingerprint ? "Sí" : "No"} 
                            color={user.registered_fingerprint ? "#17A67D" : "#DC2626"} 
                        />
                        <InfoItem 
                            icon={user.blocked ? "shield-off" : "shield"} 
                            label="Estado de Cuenta" 
                            value={user.blocked ? `Bloqueada: ${user.block_reason}` : "Activa"} 
                            color={user.blocked ? "#DC2626" : "#17A67D"} 
                        />
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#f4f7f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        color: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f7f9',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        fontFamily: 'Inter-Regular',
    },
    scrollContent: {
        padding: 20,
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#D9A404',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarText: {
        fontFamily: 'Inter-Bold',
        fontSize: 40,
        color: 'white',
    },
    profileName: {
        fontFamily: 'Inter-Bold',
        fontSize: 22,
        color: '#333',
        textAlign: 'center',
    },
    profileMatricula: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 4,
    },
    pendingBadge: {
        backgroundColor: '#FEF3C7',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 10,
    },
    pendingText: {
        color: '#D97706',
        fontSize: 12,
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    cardTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: '#333',
        marginBottom: 5,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    infoLabel: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    infoValue: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#555',
        flexWrap: 'wrap',
    },
    bioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#17A67D',
    },
    editButtonText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: '#17A67D',
        marginLeft: 8,
    },
    bioText: {
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    bioInput: {
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        backgroundColor: '#f4f7f9',
        borderRadius: 10,
        padding: 15,
        minHeight: 120,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
});