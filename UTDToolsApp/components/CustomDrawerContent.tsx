// // En: components/CustomDrawerContent.tsx

// import { Feather, Ionicons } from '@expo/vector-icons';
// import { Href, useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import {
//     Image,
//     SafeAreaView,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import CustomAlert from './CustomAlert'; // Tu componente de alerta

// // --- Datos del usuario (sin cambios) ---
// const userData = {
//     name: 'Paulina Ale Breceda',
//     email: 'paulina_3141230012@utd.edu.mx',
//     avatar: require('../assets/images/utd.png'),
// };

// const DrawerItem = ({ icon, name, href, routeName, activeRoute, navigation }: { icon: any, name: string, href: string, routeName: string, activeRoute?: string, navigation: any }) => {
//     // ... (sin cambios en este componente)
//     const router = useRouter();
//     const isActive = activeRoute === routeName;

//     const handlePress = () => {
//         navigation.closeDrawer();
//         router.replace(href as Href);
//     };

//     return (
//         <TouchableOpacity
//             onPress={handlePress}
//             style={[styles.drawerItem, isActive && styles.activeDrawerItem]}
//         >
//             {isActive && <View style={styles.activeIndicator} />}
//             <Feather name={icon} size={22} color={isActive ? '#17A67D' : '#555'} />
//             <Text style={[styles.drawerItemText, isActive && styles.activeDrawerItemText]}>{name}</Text>
//         </TouchableOpacity>
//     );
// };


// export default function CustomDrawerContent({ navigation, state }: { navigation: any, state: any }) {
//     const router = useRouter();
//     const [alertVisible, setAlertVisible] = useState(false);

//     const activeRouteName = state?.routes[state.index]?.name;
//     const activeTabRoute = activeRouteName === '(tabs)'
//         ? state?.routes[state.index]?.state?.routes[state.routes[state.index].state.index]?.name
//         : activeRouteName;

//     // Función que se ejecuta al confirmar el cierre de sesión
//     const handleLogout = () => {
//         setAlertVisible(false); // Cierra la alerta
//         console.log("Cerrando sesión y redirigiendo..."); // Log para depuración
//         router.replace('/(auth)'); // Navega a la pantalla de login
//     };

//     // --- CAMBIO: Definir los botones para la alerta ---
//     // Aquí creamos el array de botones que tu componente CustomAlert espera.
//     const logoutButtons = [
//         {
//           text: 'Cancelar',
//           onPress: () => setAlertVisible(false), // Solo cierra la alerta
//           style: 'cancel' as 'cancel', 
//         },
//         {
//           text: 'Cerrar Sesión',
//           onPress: handleLogout, // Llama a la función de cierre de sesión
//           style: 'destructive' as 'destructive',
//         },
//     ];

//     return (
//         <SafeAreaView style={styles.safeArea}>
//             {/* --- CAMBIO: Se actualiza la llamada a CustomAlert --- */}
//             {/* Ahora usamos la prop 'buttons' y los datos correctos */}
//             <CustomAlert
//                 visible={alertVisible}
//                 title="Confirmar Cierre de Sesión"
//                 message="¿Estás seguro de que quieres salir?"
//                 type="confirm" // 'confirm' es el tipo correcto para el ícono de advertencia
//                 buttons={logoutButtons} // Pasamos el array de botones
//                 onClose={() => setAlertVisible(false)} // Para cerrar al tocar fuera o con el botón de atrás
//             />

//             <View style={styles.header}>
//                 {/* ... (sin cambios aquí) */}
//                 <Image source={userData.avatar} style={styles.logo} />
//                 <TouchableOpacity onPress={() => navigation.closeDrawer()} style={styles.closeButton}>
//                     <Feather name="x" size={24} color="#555" />
//                 </TouchableOpacity>
//             </View>
//             <View style={styles.profileInfo}>
//                 {/* ... (sin cambios aquí) */}
//                 <Ionicons name="person-circle-outline" size={28} color="#17A67D" />
//                 <View>
//                     <Text style={styles.profileName}>{userData.name}</Text>
//                     <Text style={styles.profileEmail}>{userData.email}</Text>
//                 </View>
//             </View>

//             <ScrollView style={styles.menuScrollView}>
//                 {/* ... (sin cambios aquí) */}
//                 <View style={styles.menuContainer}>
//                     <Text style={styles.menuSectionTitle}>MENÚ PRINCIPAL</Text>
//                     <DrawerItem icon="home" name="Inicio" href="/" routeName="index" activeRoute={activeTabRoute} navigation={navigation} />
//                     <DrawerItem icon="repeat" name="Préstamos Activos" href="/prestamos" routeName="prestamos" activeRoute={activeTabRoute} navigation={navigation} />
//                     <DrawerItem icon="list" name="Inventario" href="/inventario" routeName="inventario" activeRoute={activeTabRoute} navigation={navigation} />
//                     <DrawerItem icon="clock" name="Historial" href="/historial" routeName="historial" activeRoute={activeTabRoute} navigation={navigation} />
//                     <DrawerItem icon="bar-chart-2" name="Mis Estadísticas" href="/estadisticas" routeName="estadisticas" activeRoute={activeTabRoute} navigation={navigation} />
//                     <DrawerItem icon="info" name="Acerca del Proyecto" href="/acerca-de" routeName="acerca-de" activeRoute={activeTabRoute} navigation={navigation} />

//                     <Text style={styles.menuSectionTitle}>AJUSTES Y SOPORTE</Text>
//                     <DrawerItem icon="user" name="Mi Perfil" href="/(drawer)/(tabs)/perfil" routeName="perfil" activeRoute={activeTabRoute} navigation={navigation} />
//                     <DrawerItem icon="bell" name="Notificaciones" href="/(drawer)/(tabs)/notificaciones" routeName="notificaciones" activeRoute={activeTabRoute} navigation={navigation} />
//                     <DrawerItem icon="help-circle" name="Ayuda" href="/(drawer)/(tabs)/ayuda" routeName="ayuda" activeRoute={activeTabRoute} navigation={navigation} />
//                 </View>
//             </ScrollView>

//             <View style={styles.footer}>
//                 {/* Este botón no cambia, su función es solo mostrar la alerta */}
//                 <TouchableOpacity
//                     style={styles.logoutButton}
//                     onPress={() => setAlertVisible(true)}
//                 >
//                     <Feather name="log-out" size={22} color="#D9534F" />
//                     <Text style={styles.logoutText}>Cerrar Sesión</Text>
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// }


// // Estilos (sin cambios)
// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         paddingTop: 50,
//         paddingBottom: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#f0f0f0',
//     },
//     logo: {
//         width: 100,
//         height: 50,
//         resizeMode: 'contain',
//     },
//     closeButton: {
//         padding: 5,
//     },
//     profileInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 20,
//         paddingHorizontal: 20,
//     },
//     profileName: {
//         fontFamily: 'Inter-SemiBold',
//         fontSize: 16,
//         marginLeft: 10,
//     },
//     profileEmail: {
//         fontFamily: 'Inter-Regular',
//         fontSize: 12,
//         marginLeft: 10,
//         color: '#8E8E93',
//     },
//     menuScrollView: {
//         flex: 1,
//     },
//     menuContainer: {
//         padding: 15,
//         paddingTop: 0,
//     },
//     menuSectionTitle: {
//         fontFamily: 'Inter-Bold',
//         color: '#a0aec0',
//         fontSize: 12,
//         textTransform: 'uppercase',
//         marginBottom: 10,
//         marginTop: 15,
//     },
//     drawerItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 12,
//         paddingHorizontal: 15,
//         borderRadius: 10,
//         marginBottom: 5,
//     },
//     activeDrawerItem: {
//         backgroundColor: 'rgba(23, 166, 125, 0.1)',
//     },
//     activeIndicator: {
//         position: 'absolute',
//         left: 0,
//         top: 10,
//         bottom: 10,
//         width: 4,
//         backgroundColor: '#17A67D',
//         borderTopRightRadius: 4,
//         borderBottomRightRadius: 4,
//     },
//     drawerItemText: {
//         fontFamily: 'Inter-Medium',
//         fontSize: 16,
//         marginLeft: 15,
//         color: '#333',
//     },
//     activeDrawerItemText: {
//         color: '#17A67D',
//         fontFamily: 'Inter-Bold',
//     },
//     footer: {
//         padding: 20,
//         borderTopWidth: 1,
//         borderTopColor: '#f0f0f0',
//     },
//     logoutButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     logoutText: {
//         fontFamily: 'Inter-Bold',
//         fontSize: 16,
//         marginLeft: 10,
//         color: '#D9534F',
//     },
// });
// components/CustomDrawerContent.tsx

import { Feather, Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CustomAlert from './CustomAlert';
import { useUser } from '../context/UserContext';

// Función para generar iniciales del nombre
const getInitials = (name: string): string => {
    if (!name) return 'NN';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const DrawerItem = ({ 
    icon, 
    name, 
    href, 
    routeName, 
    activeRoute, 
    navigation 
}: { 
    icon: any, 
    name: string, 
    href: string, 
    routeName: string, 
    activeRoute?: string, 
    navigation: any 
}) => {
    const router = useRouter();
    const isActive = activeRoute === routeName;

    const handlePress = () => {
        navigation.closeDrawer();
        router.replace(href as Href);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.drawerItem, isActive && styles.activeDrawerItem]}
        >
            {isActive && <View style={styles.activeIndicator} />}
            <Feather name={icon} size={22} color={isActive ? '#17A67D' : '#555'} />
            <Text style={[styles.drawerItemText, isActive && styles.activeDrawerItemText]}>{name}</Text>
        </TouchableOpacity>
    );
};

export default function CustomDrawerContent({ navigation, state }: { navigation: any, state: any }) {
    const router = useRouter();
    const { user, logout } = useUser();
    const [alertVisible, setAlertVisible] = useState(false);

    const activeRouteName = state?.routes[state.index]?.name;
    const activeTabRoute = activeRouteName === '(tabs)'
        ? state?.routes[state.index]?.state?.routes[state.routes[state.index].state.index]?.name
        : activeRouteName;

    // Función que se ejecuta al confirmar el cierre de sesión
    const handleLogout = async () => {
        setAlertVisible(false);
        console.log("Cerrando sesión y redirigiendo...");
        
        try {
            await logout(); // Usar la función logout del contexto
            router.replace('/(auth)');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Aún así redirigir al login
            router.replace('/(auth)');
        }
    };

    // Botones para la alerta de confirmación
    const logoutButtons = [
        {
            text: 'Cancelar',
            onPress: () => setAlertVisible(false),
            style: 'cancel' as 'cancel', 
        },
        {
            text: 'Cerrar Sesión',
            onPress: handleLogout,
            style: 'destructive' as 'destructive',
        },
    ];

    // Obtener datos del usuario logueado
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Usuario';
    const userEmail = user?.email || 'email@utd.edu.mx';
    const userInitials = getInitials(userName);

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomAlert
                visible={alertVisible}
                title="Confirmar Cierre de Sesión"
                message="¿Estás seguro de que quieres salir?"
                type="confirm"
                buttons={logoutButtons}
                onClose={() => setAlertVisible(false)}
            />

            <View style={styles.header}>
                <Image source={require('../assets/images/utd.png')} style={styles.logo} />
                <TouchableOpacity onPress={() => navigation.closeDrawer()} style={styles.closeButton}>
                    <Feather name="x" size={24} color="#555" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
                {/* Avatar con iniciales del usuario real */}
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{userInitials}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.profileName} numberOfLines={1}>{userName}</Text>
                    <Text style={styles.profileEmail} numberOfLines={1}>{userEmail}</Text>
                   
                </View>
            </View>

            <ScrollView style={styles.menuScrollView}>
                <View style={styles.menuContainer}>
                    <Text style={styles.menuSectionTitle}>MENÚ PRINCIPAL</Text>
                    <DrawerItem 
                        icon="home" 
                        name="Inicio" 
                        href="/" 
                        routeName="index" 
                        activeRoute={activeTabRoute} 
                        navigation={navigation} 
                    />
                    <DrawerItem 
                        icon="repeat" 
                        name="Préstamos Activos" 
                        href="/prestamos" 
                        routeName="prestamos" 
                        activeRoute={activeTabRoute} 
                        navigation={navigation} 
                    />
                    <DrawerItem 
                        icon="list" 
                        name="Inventario" 
                        href="/inventario" 
                        routeName="inventario" 
                        activeRoute={activeTabRoute} 
                        navigation={navigation} 
                    />
                    <DrawerItem 
                        icon="clock" 
                        name="Historial" 
                        href="/historial" 
                        routeName="historial" 
                        activeRoute={activeTabRoute} 
                        navigation={navigation} 
                    />
                    <DrawerItem 
                        icon="bar-chart-2" 
                        name="Mis Estadísticas" 
                        href="/estadisticas" 
                        routeName="estadisticas" 
                        activeRoute={activeTabRoute} 
                        navigation={navigation} 
                    />
                    <DrawerItem 
                        icon="info" 
                        name="Acerca del Proyecto" 
                        href="/acerca-de" 
                        routeName="acerca-de" 
                        activeRoute={activeTabRoute} 
                        navigation={navigation} 
                    />

                    <Text style={styles.menuSectionTitle}>AJUSTES Y SOPORTE</Text>
                    <DrawerItem 
                        icon="user" 
                        name="Mi Perfil" 
                        href="/(drawer)/(tabs)/perfil" 
                        routeName="perfil" 
                        activeRoute={activeTabRoute} 
                        navigation={navigation} 
                    />
                    <DrawerItem 
                        icon="bell" 
                        name="Notificaciones" 
                        href="/(drawer)/(tabs)/notificaciones" 
                        routeName="notificaciones" 
                        activeRoute={activeTabRoute} 
                        navigation={navigation} 
                    />
                    <DrawerItem 
                        icon="help-circle" 
                        name="Ayuda" 
                        href="/(drawer)/(tabs)/ayuda" 
                        routeName="ayuda" 
                        activeRoute={activeTabRoute} 
                        navigation={navigation} 
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => setAlertVisible(true)}
                >
                    <Feather name="log-out" size={22} color="#D9534F" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    logo: {
        width: 100,
        height: 50,
        resizeMode: 'contain',
    },
    closeButton: {
        padding: 5,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#17A67D',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: 'white',
    },
    userInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    profileName: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 2,
    },
    profileEmail: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 2,
    },
    profileMatricula: {
        fontFamily: 'Inter-Medium',
        fontSize: 11,
        color: '#666',
    },
    pendingBadge: {
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    pendingText: {
        color: '#D97706',
        fontSize: 10,
        fontFamily: 'Inter-SemiBold',
    },
    menuScrollView: {
        flex: 1,
    },
    menuContainer: {
        padding: 15,
        paddingTop: 0,
    },
    menuSectionTitle: {
        fontFamily: 'Inter-Bold',
        color: '#a0aec0',
        fontSize: 12,
        textTransform: 'uppercase',
        marginBottom: 10,
        marginTop: 15,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 5,
    },
    activeDrawerItem: {
        backgroundColor: 'rgba(23, 166, 125, 0.1)',
    },
    activeIndicator: {
        position: 'absolute',
        left: 0,
        top: 10,
        bottom: 10,
        width: 4,
        backgroundColor: '#17A67D',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    drawerItemText: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        marginLeft: 15,
        color: '#333',
    },
    activeDrawerItemText: {
        color: '#17A67D',
        fontFamily: 'Inter-Bold',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        marginLeft: 10,
        color: '#D9534F',
    },
});