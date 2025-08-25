import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../services/apiService';

interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  timestamp: string;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      const result = await fetch('/api/v1/chat/conversations/conv-1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });
      
      if (result.ok) {
        const data = await result.json();
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#9C27B0', '#673AB7']} style={styles.header}>
        <Text style={styles.headerTitle}>Chat Support</Text>
      </LinearGradient>

      <ScrollView style={styles.messagesList}>
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageBubble,
            message.senderRole === 'customer' ? styles.customerMessage : styles.technicianMessage
          ]}>
            <Text style={styles.messageText}>{message.message}</Text>
            <Text style={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendMessage}
          disabled={loading || !newMessage.trim()}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  messagesList: { flex: 1, padding: 20 },
  messageBubble: { padding: 12, marginVertical: 4, borderRadius: 12, maxWidth: '80%' },
  customerMessage: { backgroundColor: '#2196F3', alignSelf: 'flex-end' },
  technicianMessage: { backgroundColor: '#E0E0E0', alignSelf: 'flex-start' },
  messageText: { fontSize: 16, color: 'black' },
  timestamp: { fontSize: 12, color: '#666', marginTop: 4 },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: 'white' },
  messageInput: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  sendButton: { backgroundColor: '#9C27B0', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
});

export default ChatScreen;