// En: components/navigation/TabBarIcon.tsx
import { Ionicons } from '@expo/vector-icons';
import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { type ComponentProps } from 'react';

export function TabBarIcon({ style, ...rest }: IconProps<ComponentProps<typeof Ionicons>['name']>) {
  // Este componente simplemente muestra un ícono de la librería Ionicons.
  // El tamaño y el margen inferior son para que se vea bien en la barra de pestañas.
  return <Ionicons size={28} style={[{ marginBottom: -3 }, style]} {...rest} />;
}