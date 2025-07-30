// En: app/(drawer)/(tabs)/index.tsx
import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9; 

const carouselData = [
    { id: '1', title: 'Laboratorio Moderno', subtitle: 'Equipado con tecnología de punta.', image: require('../../../assets/images/carousel/pesado3.jpg'), },
    { id: '2', title: 'Préstamos Simplificados', subtitle: 'Acceso rápido a herramientas.', image: require('../../../assets/images/carousel/pesado1.jpg'), },
    { id: '3', title: 'Gestión Eficiente', subtitle: 'Control total desde la app.', image: require('../../../assets/images/carousel/pesado2.jpg'), },
];
const materialsData = [
    { id: '1', name: 'Arduino Uno R3', current: 15, total: 20, color: '#17A67D' },
    { id: '2', name: 'Sensores Ultrasónicos', current: 25, total: 30, color: '#17A67D' },
    { id: '3', name: 'Protoboards', current: 40, total: 50, color: '#D9A404' },
];
const MaterialStatusItem = ({ name, current, total, color }: { name: string, current: number, total: number, color: string }) => {
    const percentage = (current / total) * 100;
    return (
        <View style={styles.materialItem}>
            <View style={styles.materialTextContainer}>
                <Text style={styles.materialName}>{name}</Text>
                <Text style={styles.materialStatus}>{`${current} / ${total}`}</Text>
            </View>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
};

export default function HomeScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onMomentumScrollEnd = (event: any) => {
        const index = Math.floor(
            Math.floor(event.nativeEvent.contentOffset.x) /
            Math.floor(event.nativeEvent.layoutMeasurement.width)
        );
        setActiveIndex(index);
    };

    const handleScroll = (direction: 'prev' | 'next') => {
        let nextIndex;
        if (direction === 'next') {
            nextIndex = activeIndex === carouselData.length - 1 ? 0 : activeIndex + 1;
        } else {
            nextIndex = activeIndex === 0 ? carouselData.length - 1 : activeIndex - 1;
        }
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
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
                <Text style={styles.headerTitle}>Inicio</Text>
                <View style={styles.headerButton} />
            </LinearGradient>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.welcomeTitle}>Bienvenido a UTD Tools</Text>
                    <View style={styles.carouselContainer}>
                        <FlatList
                            ref={flatListRef}
                            data={carouselData}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            onMomentumScrollEnd={onMomentumScrollEnd}
                            renderItem={({ item }) => (
                                <View style={styles.carouselCard}>
                                    <ImageBackground
                                        source={item.image}
                                        style={styles.carouselItem}
                                        imageStyle={{ borderRadius: 15 }}
                                        resizeMode="cover" 
                                    >
                                        <View style={styles.carouselOverlay}>
                                            <View style={styles.carouselTextContainer}>
                                                <Text style={styles.carouselTitle}>{item.title}</Text>
                                                <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </View>
                            )}
                        />
                        <TouchableOpacity style={[styles.arrowButton, styles.arrowLeft]} onPress={() => handleScroll('prev')}>
                            <Feather name="chevron-left" size={24} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.arrowButton, styles.arrowRight]} onPress={() => handleScroll('next')}>
                            <Feather name="chevron-right" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.paginationContainer}>
                        {carouselData.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot, 
                                    { backgroundColor: index === activeIndex ? '#17A67D' : '#e0e0e0' }
                                ]}
                            />
                        ))}
                    </View>
                </View>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Feather name="package" size={22} color="#333" />
                        <Text style={styles.cardTitle}>Materiales Disponibles (Resumen)</Text>
                    </View>
                    <View style={styles.materialsList}>
                        {materialsData.map(item => (
                            <MaterialStatusItem key={item.id} {...item} />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.inventoryButton} onPress={() => router.push('/inventario')}>
                        <Text style={styles.inventoryButtonText}>Ver inventario completo</Text>
                        <Feather name="list" size={18} color="#17A67D" />
                    </TouchableOpacity>
                </View>
                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/estadisticas')}>
                        <Feather name="bar-chart-2" size={28} color="#D9A404" />
                        <Text style={styles.actionText}>Mis Estadísticas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/acerca-de')}>
                        <Feather name="info" size={28} color="#D97C0B" />
                        <Text style={styles.actionText}>Acerca de</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: { flex: 1, backgroundColor: '#f4f7f9', },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, },
    headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', },
    headerTitle: { fontSize: 20, fontFamily: 'Inter-Bold', color: 'white', },
    container: { flex: 1, },
    scrollContent: { paddingVertical: 20, },
    card: { backgroundColor: 'white', borderRadius: 20, paddingVertical: 20, marginBottom: 20, marginHorizontal: width * 0.05, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 20, },
    welcomeTitle: { fontSize: 22, fontFamily: 'Inter-Bold', color: '#333', paddingHorizontal: 20, marginBottom: 20, textAlign: 'center', },
    cardTitle: { fontSize: 20, fontFamily: 'Inter-Bold', color: '#333', marginLeft: 10, },
    carouselContainer: { height: 180, position: 'relative', },
    carouselCard: { width: CARD_WIDTH, height: '100%', paddingHorizontal: 20, },
    carouselItem: { flex: 1, justifyContent: 'flex-end', borderRadius: 15, overflow: 'hidden', },
    carouselOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', padding: 15, },
    carouselTextContainer: {},
    carouselTitle: { fontSize: 24, fontFamily: 'Inter-Bold', color: 'white', },
    carouselSubtitle: { fontSize: 15, fontFamily: 'Inter-Regular', color: 'white', marginTop: 4, },
    arrowButton: { position: 'absolute', top: '50%', marginTop: -20, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', elevation: 3, zIndex: 10, },
    arrowLeft: { left: 30, },
    arrowRight: { right: 30, },
    paginationContainer: { flexDirection: 'row', justifyContent: 'center', paddingTop: 20, },
    paginationDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, },
    materialsList: { width: '100%', paddingHorizontal: 20, },
    materialItem: { marginBottom: 18, },
    materialTextContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, },
    materialName: { fontSize: 16, fontFamily: 'Inter-Medium', color: '#555', },
    materialStatus: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#333', },
    progressBarBackground: { height: 10, backgroundColor: '#e9ecef', borderRadius: 5, },
    progressBarFill: { height: '100%', borderRadius: 5, },
    inventoryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, paddingTop: 20, marginHorizontal: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', },
    inventoryButtonText: { color: '#17A67D', fontSize: 16, fontFamily: 'Inter-Bold', marginRight: 8, },
    quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: width * 0.05, },
    actionCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '48%', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, },
    actionText: { marginTop: 10, fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#333', },
});
