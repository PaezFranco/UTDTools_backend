// En: app/(drawer)/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

const CustomTabBarIcon = ({ name, color, focused }: { name: any, color: string, focused: boolean }) => {
    return (
        <View style={styles.iconWrapper}>
            {focused && <View style={styles.activeIconBackground} />}
            <Ionicons name={name} size={26} color={color} />
        </View>
    );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#17A67D',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
            backgroundColor: 'white',
            height: Platform.OS === 'ios' ? 90 : 70,
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 10,
        },
        tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: 10,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, focused }) => (<CustomTabBarIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />), }} />
      <Tabs.Screen name="prestamos" options={{ title: 'Préstamos', tabBarIcon: ({ color, focused }) => (<CustomTabBarIcon name={focused ? 'cube' : 'cube-outline'} color={color} focused={focused} />), }} />
      <Tabs.Screen name="inventario" options={{ title: 'Inventario', tabBarIcon: ({ color, focused }) => (<CustomTabBarIcon name={focused ? 'list' : 'list-outline'} color={color} focused={focused} />), }} />
      <Tabs.Screen name="historial" options={{ title: 'Historial', tabBarIcon: ({ color, focused }) => (<CustomTabBarIcon name={focused ? 'time' : 'time-outline'} color={color} focused={focused} />), }} />
      <Tabs.Screen name="acerca-de" options={{ title: 'Acerca de', tabBarIcon: ({ color, focused }) => (<CustomTabBarIcon name={focused ? 'information-circle' : 'information-circle-outline'} color={color} focused={focused} />), }} />
      
      {/* --- Pantallas que existen en las pestañas pero están ocultas de la barra --- */}
      <Tabs.Screen
        name="estadisticas"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="notificaciones"
        options={{ href: null }}
      />
      {/* --- CAMBIO: Se añade la pantalla de Ayuda --- */}
      <Tabs.Screen
        name="ayuda"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
    iconWrapper: { position: 'relative', width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    activeIconBackground: { position: 'absolute', width: '100%', height: '100%', borderRadius: 20, backgroundColor: '#17A67D', opacity: 0.1, },
});
