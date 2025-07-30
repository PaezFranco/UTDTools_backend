// En: app/(drawer)/(tabs)/ayuda.tsx
import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import PolicyModal from '../../../components/PolicyModal'; // Importamos el modal de políticas

// --- DATOS PARA LAS PREGUNTAS FRECUENTES ---
const faqData = [
    {
        question: '¿Cómo solicito un préstamo de material?',
        answer: 'Para solicitar un préstamo, dirígete a la pestaña "Inventario", busca el material que necesitas y sigue las instrucciones en pantalla para completar tu solicitud. Deberás presentarte en la caseta para la validación final.'
    },
    {
        question: '¿Qué hago si un material está dañado?',
        answer: 'Si recibes un material dañado o este se daña durante su uso, repórtalo inmediatamente al personal de la caseta al momento de la devolución para evitar penalizaciones.'
    },
    {
        question: '¿Puedo renovar un préstamo?',
        answer: 'Actualmente, la renovación de préstamos no está disponible a través de la aplicación. Debes devolver el material en la fecha indicada y, si sigue disponible, puedes solicitar un nuevo préstamo.'
    },
    {
        question: '¿Cómo cambio mi contraseña?',
        answer: 'La gestión de contraseñas se realiza a través del sistema de control escolar de la universidad. Esta aplicación utiliza las mismas credenciales.'
    },
    {
        question: 'Olvidé mi contraseña, ¿qué hago?',
        answer: 'En la pantalla de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Se te pedirá tu correo institucional para enviarte las instrucciones de recuperación.'
    },
];

// --- CAMBIO: Texto de las políticas completo ---
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


const FaqItem = ({ item }: { item: typeof faqData[0] }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <View style={styles.faqItem}>
            <TouchableOpacity style={styles.faqQuestionContainer} onPress={() => setIsOpen(!isOpen)}>
                <Text style={styles.faqQuestionText}>{item.question}</Text>
                <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={22} color="#555" />
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
            )}
        </View>
    );
};

export default function AyudaScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isPolicyVisible, setPolicyVisible] = useState(false);

    const filteredFaqData = useMemo(() => {
        if (!searchQuery) return faqData;
        const lowercasedQuery = searchQuery.toLowerCase();
        return faqData.filter(item => 
            item.question.toLowerCase().includes(lowercasedQuery) ||
            item.answer.toLowerCase().includes(lowercasedQuery)
        );
    }, [searchQuery]);

    const handleOpenURL = async (url: string) => {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', 'No se pudo abrir el enlace.');
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
                <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
                <View style={styles.headerButton} />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Buscar en Preguntas Frecuentes..."
                        placeholderTextColor="#8E8E93"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => handleOpenURL('https://www.youtube.com')}>
                        <Feather name="book-open" size={24} color="#17A67D" />
                        <Text style={styles.actionText}>Guía de Usuario</Text>
                    </TouchableOpacity>
                    {/* --- CAMBIO: Se añade el asunto al correo --- */}
                    <TouchableOpacity style={styles.actionCard} onPress={() => handleOpenURL('mailto:lux.uexperience@gmail.com?subject=Soporte Técnico - App UTD Tools')}>
                        <Feather name="message-square" size={24} color="#17A67D" />
                        <Text style={styles.actionText}>Contactar Soporte</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => setPolicyVisible(true)}>
                        <Feather name="shield" size={24} color="#17A67D" />
                        <Text style={styles.actionText}>Políticas</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
                {filteredFaqData.length > 0 ? (
                    filteredFaqData.map((item, index) => (
                        <FaqItem key={index} item={item} />
                    ))
                ) : (
                    <View style={styles.noResultsContainer}>
                        <Feather name="search" size={30} color="#a0aec0" />
                        <Text style={styles.noResultsText}>No se encontraron preguntas</Text>
                    </View>
                )}
            </ScrollView>

            <PolicyModal
                visible={isPolicyVisible}
                onClose={() => setPolicyVisible(false)}
                title="Políticas de Privacidad"
                content={privacyPolicyContent}
            />
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontFamily: 'Inter-Regular',
        fontSize: 16,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    actionCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        width: '32%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    actionText: {
        marginTop: 10,
        fontFamily: 'Inter-SemiBold',
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
    sectionTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: '#333',
        marginBottom: 15,
    },
    faqItem: {
        backgroundColor: 'white',
        borderRadius: 15,
        marginBottom: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    faqQuestionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestionText: {
        flex: 1,
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#333',
        marginRight: 10,
    },
    faqAnswerContainer: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 15,
    },
    faqAnswerText: {
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    noResultsContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
    },
    noResultsText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#555',
        marginTop: 10,
    },
});
