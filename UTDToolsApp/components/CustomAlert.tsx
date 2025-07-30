// En: components/CustomAlert.tsx
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  // --- CAMBIO: Se hace opcional y se añade onClose para retrocompatibilidad ---
  buttons?: AlertButton[]; 
  onClose?: () => void;
  type?: 'success' | 'error' | 'confirm';
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, buttons, onClose, type = 'error' }) => {
  const iconName = type === 'success' ? 'check' : (type === 'error' ? 'x' : 'alert-triangle');
  const iconColor = type === 'success' ? '#17A67D' : (type === 'error' ? '#D9534F' : '#D9534F');

  // --- CAMBIO: Lógica para manejar los botones ---
  // Si se proporciona un array de botones, se usa.
  // Si no, se crea un botón "Entendido" por defecto que usa la función onClose.
  const finalButtons = buttons ? buttons : [{ text: 'Entendido', onPress: onClose || (() => {}), style: 'default' }];

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        const cancelButton = finalButtons.find(b => b.style === 'cancel');
        if (cancelButton) {
            cancelButton.onPress();
        } else if (onClose) {
            onClose();
        }
      }}
    >
      <View style={styles.modalBackground}>
        <View style={styles.alertContainer}>
          <View style={[styles.iconWrapper, { backgroundColor: iconColor }]}>
            <Feather name={iconName as any} size={36} color="white" />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {finalButtons.map((button, index) => {
              let buttonStyle = styles.defaultButton;
              let textStyle = styles.defaultButtonText;
              if (button.style === 'destructive') {
                buttonStyle = styles.destructiveButton;
              } else if (button.style === 'cancel') {
                buttonStyle = styles.cancelButton;
                textStyle = styles.cancelButtonText;
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.button, buttonStyle]}
                  onPress={button.onPress}
                >
                  <Text style={textStyle}>{button.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    paddingTop: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  iconWrapper: {
    position: 'absolute',
    top: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  defaultButton: {
    backgroundColor: '#17A67D',
  },
  defaultButtonText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  destructiveButton: {
    backgroundColor: '#D9534F',
  },
  cancelButton: {
    backgroundColor: '#f0f2f5',
  },
  cancelButtonText: {
    color: '#555',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});

export default CustomAlert;
