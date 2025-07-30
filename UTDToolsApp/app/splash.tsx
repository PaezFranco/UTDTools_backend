// En: app/splash.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

export default function AnimatedSplashScreen() {
    const router = useRouter();
    // Creamos valores animados para la opacidad y la escala
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        // Definimos la secuencia de animación
        Animated.timing(opacity, {
            toValue: 1,
            duration: 1500, // Duración del fundido de entrada
            useNativeDriver: true,
            easing: Easing.ease,
        }).start();

        Animated.timing(scale, {
            toValue: 1,
            duration: 2000, // Duración del efecto de zoom
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 1, 0.5, 1), // Curva suave
        }).start();

        // Redirige después de que la animación haya tenido tiempo de completarse
        const timer = setTimeout(() => {
            router.replace('/(auth)');
        }, 2500); // 2.5 segundos

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity, transform: [{ scale }] }}>
                <Image
                    source={require('../assets/images/utd.png')}
                    style={styles.logo}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // Fondo blanco para que el logo resalte
    },
    logo: {
        width: 250, // Ajusta el tamaño de tu logo como prefieras
        height: 125,
        resizeMode: 'contain',
    },
});
