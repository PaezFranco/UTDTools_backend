// En: app/(drawer)/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '../../components/CustomDrawerContent';

export default function AppDrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          // --- CAMBIO: Ancho reducido para un look más moderno ---
          width: '70%', 
        },
      }}
    >
      {/* Esta línea le dice al Drawer que su contenido principal
          es el grupo de rutas "(tabs)". */}
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
