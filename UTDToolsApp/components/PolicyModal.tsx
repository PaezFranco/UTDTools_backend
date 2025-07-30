// En: components/PolicyModal.tsx
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- CAMBIO: La interfaz ahora acepta un array de objetos para contenido estructurado ---
interface ContentItem {
  type: 'heading' | 'paragraph' | 'listItem';
  text: string;
}

interface PolicyModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: ContentItem[];
}

const PolicyModal: React.FC<PolicyModalProps> = ({ visible, onClose, title, content }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* --- CAMBIO: Mapeamos el contenido para renderizar con diferentes estilos --- */}
            {content.map((item, index) => {
              if (item.type === 'heading') {
                return <Text key={index} style={styles.heading}>{item.text}</Text>;
              }
              if (item.type === 'listItem') {
                return (
                  <View key={index} style={styles.listItemContainer}>
                    <Text style={styles.listItemBullet}>•</Text>
                    <Text style={styles.listItemText}>{item.text}</Text>
                  </View>
                );
              }
              return <Text key={index} style={styles.paragraph}>{item.text}</Text>;
            })}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Entendido</Text>
          </TouchableOpacity>
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
  },
  modalContainer: {
    width: '90%',
    height: '75%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 15,
  },
  // --- CAMBIO: Nuevos estilos para contenido estructurado ---
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 10,
  },
  listItemContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 10,
  },
  listItemBullet: {
    fontSize: 16,
    color: '#555',
    marginRight: 8,
    lineHeight: 24,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  // --- Fin de nuevos estilos ---
  closeButton: {
    backgroundColor: '#17A67D',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PolicyModal;
