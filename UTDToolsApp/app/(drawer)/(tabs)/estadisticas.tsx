// En: app/(drawer)/(tabs)/estadisticas.tsx
import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- Interfaces para los props de los componentes ---
interface StatCardProps {
    icon: any;
    value: string;
    label: string;
    color: string;
}

interface InfoCardProps {
    icon: any;
    title: string;
    mainText: string;
    subText: string;
    mainTextColor?: string;
    mainIsTag?: boolean;
}

interface CategoryBreakdownItemProps {
    name: string;
    percentage: string;
    color: string;
}

// --- Componente para las tarjetas pequeñas ---
const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => {
    return (
        <View style={styles.statCard}>
            <Feather name={icon} size={28} color={color} />
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
};

// --- Componente para las tarjetas grandes ---
const InfoCard: React.FC<InfoCardProps> = ({ icon, title, mainText, subText, mainTextColor, mainIsTag }) => {
    return (
        <View style={styles.infoCard}>
            <View style={styles.largeCardHeader}>
                <Feather name={icon} size={18} color="#8E8E93" />
                <Text style={styles.largeCardTitle}>{title}</Text>
            </View>
            <View style={styles.largeCardContent}>
                {mainIsTag ? (
                    <View style={styles.tagContainer}>
                        {/* * MODIFICACIÓN: Se añaden las propiedades `numberOfLines={1}` y `adjustsFontSizeToFit`.
                          * `numberOfLines={1}`: Fuerza a que el texto se mantenga en una sola línea.
                          * `adjustsFontSizeToFit`: Reduce automáticamente el tamaño de la fuente para que el texto quepa.
                          * Esto soluciona el problema de que "Microcontroladores" se parta en dos líneas.
                        */}
                        <Text 
                            style={styles.tagText}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {mainText}
                        </Text>
                    </View>
                ) : (
                    <Text style={[styles.largeCardValue, { color: mainTextColor || '#333' }]}>{mainText}</Text>
                )}
                <Text style={styles.largeCardSubtitle}>{subText}</Text>
            </View>
        </View>
    );
};

// --- Componente para el desglose de categorías ---
const CategoryBreakdownItem: React.FC<CategoryBreakdownItemProps> = ({ name, percentage, color }) => {
    return (
        <View style={styles.breakdownItem}>
            <View style={styles.breakdownTextContainer}>
                <Text style={styles.breakdownName}>{name}</Text>
                <Text style={styles.breakdownPercentage}>{percentage}</Text>
            </View>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: percentage, backgroundColor: color }]} />
            </View>
        </View>
    );
};

// --- Datos simulados para el desglose ---
const breakdownData = [
    { name: 'Microcontroladores', percentage: '42.8%', color: '#17A67D' },
    { name: 'Sensores', percentage: '28.6%', color: '#17A67D' },
    { name: 'Componentes', percentage: '17.9%', color: '#D9A404' },
    { name: 'Herramientas', percentage: '10.7%', color: '#D97C0B' },
];

export default function EstadisticasScreen() {
    const navigation = useNavigation();

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
                <Text style={styles.headerTitle}>Mis Estadísticas</Text>
                <View style={styles.headerButton} />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.statsGrid}>
                    <StatCard icon="package" value="28" label="Préstamos Totales" color="#17A67D" />
                    <StatCard icon="clock" value="3" label="Préstamos Activos" color="#17A67D" />
                    <StatCard icon="check-circle" value="20" label="Devueltos a Tiempo" color="#17A67D" />
                    <StatCard icon="alert-triangle" value="5" label="Devueltos Tarde" color="#D97C0B" />
                    
                    <InfoCard 
                        icon="bar-chart-2" 
                        title="Categoría Popular" 
                        mainText="Microcontroladores"
                        subText="12 Préstamos"
                        mainIsTag={true}
                    />
                    <InfoCard 
                        icon="watch" 
                        title="Duración Promedio" 
                        mainText="5 días"
                        subText="Por Préstamo"
                        mainTextColor="#D97C0B"
                    />
                </View>

                <View style={styles.breakdownCard}>
                    <View style={styles.breakdownHeader}>
                        <Feather name="clock" size={20} color="#333" />
                        <Text style={styles.breakdownTitle}>Desglose de Préstamos por Categoría</Text>
                    </View>
                    <View>
                        {breakdownData.map((item, index) => (
                            <CategoryBreakdownItem key={index} {...item} />
                        ))}
                    </View>
                </View>

                <Text style={styles.footerText}>Datos actualizados al 17/7/2025</Text>
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
        padding: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        width: '48.5%',
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
        minHeight: 130,
        justifyContent: 'center',
    },
    statValue: {
        fontFamily: 'Inter-Bold',
        fontSize: 36,
        marginVertical: 5,
    },
    statLabel: {
        fontFamily: 'Inter-Medium',
        fontSize: 13,
        color: '#555',
        textAlign: 'center',
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        width: '48.5%',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
        minHeight: 130,
        justifyContent: 'center', // Centra el contenido verticalmente
    },
    largeCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute', // Posiciona el header de forma absoluta
        top: 15,
        left: 15,
    },
    largeCardTitle: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: '#8E8E93',
        marginLeft: 6,
    },
    largeCardContent: {
        // Se elimina flex: 1 para que el contenido no compita con el header
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20, // Añade espacio para el header que está absoluto
    },
    tagContainer: {
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#17A67D',
        marginBottom: 8,
        alignSelf: 'center',
        maxWidth: '100%', // Asegura que el tag no se desborde
    },
    tagText: {
        fontFamily: 'Inter-Bold',
        color: 'white',
        fontSize: 14, // Ligeramente más grande para mejor lectura
        textAlign: 'center',
    },
    largeCardValue: {
        fontFamily: 'Inter-Bold',
        fontSize: 32,
        marginBottom: 8,
        textAlign: 'center',
    },
    largeCardSubtitle: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
    },
    breakdownCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    breakdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    breakdownTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#333',
        marginLeft: 10,
    },
    breakdownItem: {
        marginBottom: 15,
    },
    breakdownTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    breakdownName: {
        fontFamily: 'Inter-Medium',
        fontSize: 15,
        color: '#4a5568',
    },
    breakdownPercentage: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 15,
        color: '#2d3748',
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    footerText: {
        textAlign: 'center',
        fontFamily: 'Inter-Regular',
        color: '#a0aec0',
        fontSize: 12,
        marginTop: 10,
    },
});
