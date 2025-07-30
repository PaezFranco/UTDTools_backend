// En: app/(drawer)/(tabs)/notificaciones.tsx
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- CAMBIO: Se añade el estado 'read' a los datos ---
const initialNotificationsData = [
    { id: '1', type: 'success', title: 'Préstamo Aprobado', message: 'Tu solicitud para el Arduino Uno ha sido aprobada.', date: new Date(2025, 6, 17, 14, 30), time: 'Hace 5 min', read: false },
    { id: '2', type: 'warning', title: 'Devolución Próxima', message: 'El Sensor Ultrasónico debe ser devuelto mañana.', date: new Date(2025, 6, 17, 12, 0), time: 'Hace 2 horas', read: false },
    { id: '3', type: 'info', title: 'Nuevo Material Disponible', message: 'Se ha añadido un nuevo kit de Raspberry Pi al inventario.', date: new Date(2025, 6, 16), time: 'Ayer', read: true },
    { id: '4', type: 'error', title: 'Préstamo Vencido', message: 'El Protoboard debió ser devuelto el 05/06.', date: new Date(2025, 6, 14), time: 'Hace 3 días', read: false },
];

const notificationStyles = {
    success: { color: '#17A67D', icon: 'check-circle' },
    warning: { color: '#D9A404', icon: 'alert-triangle' },
    info: { color: '#0A7360', icon: 'info' },
    error: { color: '#D9534F', icon: 'x-circle' },
};

// --- CAMBIO: El componente ahora es interactivo ---
const NotificationCard = ({ notification, onToggleRead }: { notification: typeof initialNotificationsData[0], onToggleRead: (id: string) => void }) => {
    const styleInfo = notificationStyles[notification.type as keyof typeof notificationStyles];

    return (
        <TouchableOpacity onPress={() => onToggleRead(notification.id)}>
            <View style={[styles.notificationCard, { borderLeftColor: styleInfo.color, opacity: notification.read ? 0.6 : 1 }]}>
                <View style={styles.iconContainer}>
                    <Feather name={styleInfo.icon as any} size={24} color={styleInfo.color} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function NotificacionesScreen() {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(initialNotificationsData);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const filteredNotifications = useMemo(() => {
        return notifications.filter(notif => {
            const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  notif.message.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesDate = !selectedDate || 
                                notif.date.getFullYear() === selectedDate.getFullYear() &&
                                notif.date.getMonth() === selectedDate.getMonth() &&
                                notif.date.getDate() === selectedDate.getDate();

            return matchesSearch && matchesDate;
        });
    }, [notifications, searchQuery, selectedDate]);

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const clearDateFilter = () => {
        setSelectedDate(undefined);
    };

    // --- CAMBIO: Lógica para marcar como leídas/no leídas ---
    const handleToggleRead = (id: string) => {
        setNotifications(
            notifications.map(notif => 
                notif.id === id ? { ...notif, read: !notif.read } : notif
            )
        );
    };

    const handleMarkAll = (markAsRead: boolean) => {
        setNotifications(
            notifications.map(notif => ({ ...notif, read: markAsRead }))
        );
    };

    const allAreRead = notifications.every(notif => notif.read);

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
                <Text style={styles.headerTitle}>Notificaciones</Text>
                <View style={styles.headerButton} />
            </LinearGradient>

            <View style={styles.filterContainer}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Buscar notificaciones..."
                        placeholderTextColor="#8E8E93"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.dateFilterButton} onPress={() => setShowDatePicker(true)}>
                    <Feather name="calendar" size={20} color="#555" />
                </TouchableOpacity>
            </View>

            {selectedDate && (
                <View style={styles.activeFilterBanner}>
                    <Text style={styles.activeFilterText}>
                        Mostrando notificaciones para: {selectedDate.toLocaleDateString('es-ES')}
                    </Text>
                    <TouchableOpacity onPress={clearDateFilter}>
                        <Feather name="x" size={18} color="#17A67D" />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <NotificationCard key={notification.id} notification={notification} onToggleRead={handleToggleRead} />
                    ))
                ) : (
                    <View style={styles.noResultsContainer}>
                        <Feather name="bell-off" size={40} color="#a0aec0" />
                        <Text style={styles.noResultsText}>No hay notificaciones</Text>
                        <Text style={styles.noResultsSubText}>No tienes notificaciones nuevas o que coincidan con tu búsqueda.</Text>
                    </View>
                )}
                
                {notifications.length > 0 && (
                    <TouchableOpacity 
                        style={styles.markAsReadButton} 
                        onPress={() => handleMarkAll(!allAreRead)}
                    >
                        <Text style={styles.markAsReadButtonText}>
                            {allAreRead ? 'Marcar todas como no leídas' : 'Marcar todas como leídas'}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
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
    filterContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        borderRadius: 15,
        paddingHorizontal: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 45,
        fontFamily: 'Inter-Regular',
        fontSize: 16,
    },
    dateFilterButton: {
        marginLeft: 10,
        height: 45,
        width: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        borderRadius: 15,
    },
    activeFilterBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(23, 166, 125, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    activeFilterText: {
        fontFamily: 'Inter-Medium',
        color: '#0A7360',
        fontSize: 12,
    },
    scrollContent: {
        padding: 20,
    },
    notificationCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    notificationMessage: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
    },
    notificationTime: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: '#8E8E93',
    },
    markAsReadButton: {
        marginTop: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 15,
        borderWidth: 1.5,
        borderColor: '#17A67D',
        alignItems: 'center',
    },
    markAsReadButtonText: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        color: '#17A67D',
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 50,
    },
    noResultsText: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: '#555',
        marginTop: 10,
    },
    noResultsSubText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 5,
        textAlign: 'center',
    },
});
