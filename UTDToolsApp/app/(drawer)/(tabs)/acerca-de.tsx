// En: app/(drawer)/(tabs)/acerca-de.tsx
import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- Datos para los objetivos clave ---
const objectivesData = [
    { icon: 'zap', text: 'Optimizar la gestión de recursos educativos mediante tecnología.' },
    { icon: 'code', text: 'Proveer una plataforma intuitiva y fácil de usar para estudiantes y administradores.' },
    { icon: 'message-circle', text: 'Fomentar la adopción de herramientas digitales en el ámbito académico.' },
    { icon: 'cpu', text: 'Mejorar la experiencia de aprendizaje a través de un acceso eficiente a materiales.' },
];

// --- Datos para el equipo ---
const teamData = [
    {
        initials: 'PB',
        name: 'Paulina Ale Breceda',
        role: 'Scrum Master, Full-Stack Developer & UX/UI Designer',
        skills: 'Gestión de Proyectos, Desarrollo Full-Stack, Diseño UX/UI y Documentación Técnica',

        avatarColor: '#17A67D',
    },
    {
        initials: 'AF',
        name: 'Amparo Franco Páez',
        role: 'Backend Developer, IoT Engineer & QA Tester',
        skills: 'Desarrollo Backend, Gestión de Base de Datos, Sistemas Iot y Pruebas Funcionales',
        avatarColor: '#17A67D',
    },
    {
        initials: 'CM',
        name: 'Cecilia Gabriela Mendoza Gonzalez',
        role: 'Branding & Corporate Web Developer',
        skills: 'Diseño de Identidad Visual, Desarrollo Web Promocional y Material Corporativo',
        avatarColor: '#17A67D',
    },
];

const ObjectiveItem = ({ icon, text }: { icon: any, text: string }) => {
    return (
        <View style={styles.objectiveItem}>
            <View style={styles.objectiveIconContainer}>
                <Feather name={icon} size={22} color="#17A67D" />
            </View>
            <Text style={styles.objectiveText}>{text}</Text>
        </View>
    );
};

const TeamMemberCard = ({ member }: { member: typeof teamData[0] }) => {
    return (
        <View style={styles.teamMemberCard}>
            <View style={[styles.avatar, { backgroundColor: member.avatarColor }]}>
                <Text style={styles.avatarText}>{member.initials}</Text>
            </View>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRole}>{member.role}</Text>
            <Text style={styles.memberSkills}>{member.skills}</Text>
        </View>
    );
};

export default function AcercaDeScreen() {
    const navigation = useNavigation();

    const handleContactPress = async () => {
        const email = 'lux.uexperience@gmail.com';
        const subject = 'Colaboración o Información sobre UTD Tools';
        const url = `mailto:${email}?subject=${subject}`;

        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', 'No se pudo abrir la aplicación de correo.');
        }
    };

    return (
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
                <Text style={styles.headerTitle}>Acerca de UTD Tools</Text>
                <View style={styles.headerButton} />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Feather name="info" size={24} color="#17A67D" />
                        <Text style={styles.cardTitle}>Nuestra Misión</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        <Text style={{ fontFamily: 'Inter-Bold' }}>UTD Tools</Text> nace de la necesidad de modernizar y simplificar la administración de recursos y materiales en entornos educativos. Creemos firmemente que la tecnología puede ser un aliado poderoso para potenciar el aprendizaje y la eficiencia operativa en las instituciones.
                    </Text>
                    <Text style={styles.paragraph}>
                        Nuestro objetivo es proporcionar una solución integral que permita a estudiantes y personal administrativo interactuar de manera fluida, segura y transparente con los recursos disponibles, optimizando tiempos y mejorando la experiencia educativa general.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Feather name="target" size={24} color="#17A67D" />
                        <Text style={styles.cardTitle}>Objetivos Clave</Text>
                    </View>
                    {objectivesData.map((item, index) => (
                        <ObjectiveItem key={index} icon={item.icon} text={item.text} />
                    ))}
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Feather name="users" size={24} color="#17A67D" />
                        <Text style={styles.cardTitle}>Conoce al Equipo</Text>
                    </View>
                    {teamData.map((member, index) => (
                        <TeamMemberCard key={index} member={member} />
                    ))}
                </View>

                <View style={styles.contactContainer}>
                    <Text style={styles.contactTitle}>¿Interesado en saber más o colaborar?</Text>
                    {/* --- CAMBIO: Botón ahora es funcional --- */}
                    <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
                        <Feather name="mail" size={20} color="white" />
                        <Text style={styles.contactButtonText}>Contáctanos</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
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
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 22,
        color: '#333',
        marginLeft: 10,
    },
    paragraph: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#555',
        lineHeight: 26,
        marginBottom: 15,
    },
    objectiveItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    objectiveIconContainer: {
        marginRight: 15,
        marginTop: 2,
    },
    objectiveText: {
        flex: 1,
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: '#4a5568',
        lineHeight: 24,
    },
    teamMemberCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontFamily: 'Inter-Bold',
        fontSize: 28,
        color: 'white',
    },
    memberName: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
    },
    memberRole: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: '#17A67D',
        textAlign: 'center',
        marginTop: 4,
        paddingHorizontal: 10,
    },
    memberSkills: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 8,
    },
    contactContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    contactTitle: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#555',
        marginBottom: 15,
    },
    contactButton: {
        flexDirection: 'row',
        backgroundColor: '#0A7360',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    contactButtonText: {
        fontFamily: 'Inter-Bold',
        color: 'white',
        fontSize: 16,
        marginLeft: 10,
    },
});
