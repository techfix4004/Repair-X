import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/apiService';

interface ChatMessage {
  id: string;
  message: string;
  messageType: 'text' | 'image' | '_file: file';
  timestamp: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    role: string;
    type: 'customer' | 'technician' | 'admin';
  };
}

interface ChatScreenProps {
  jobId: string;
  userId: string;
  userName: string;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ jobId, userId, userName, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatMessages();
    
    // Set up polling for new messages (in production, use WebSocket)
    const messagePolling = setInterval(() => {
      loadChatMessages();
    }, 3000);

    return () => clearInterval(messagePolling);
  }, [jobId]);

  const loadChatMessages = async () => {
    setLoading(true);
    try {
      const response = await apiService.getChatMessages(jobId);
      if (response._success && response.data) {
        setMessages(response.data.messages || []);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      // In production, this would use WebSocket to send messages
      const mockMessage: ChatMessage = {
        id: Date.now().toString(),
        message: newMessage,
        messageType: 'text',
        timestamp: new Date().toISOString(),
        isRead: false,
        sender: {
          id: userId,
          name: userName,
          role: 'customer',
          type: 'customer'
        }
      };

      setMessages(prev => [...prev, mockMessage]);
      setNewMessage('');
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Send typing indicator to technician
      console.log('Message sent:', mockMessage.message);
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const submitRating = async () => {
    try {
      // In production, get actual technician ID from job data
      const response = await apiService.submitRating(jobId, userId, 'tech-id', rating, ratingComment);
      if (response._success) {
        Alert.alert('Success', 'Rating submitted successfully');
        setRatingModalVisible(false);
      } else {
        Alert.alert('Error', response.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating');
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isOwnMessage = message.sender.id === userId;
    const isLastInGroup = index === messages.length - 1 || 
      messages[index + 1]?.sender.id !== message.sender.id;

    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}>
        {!isOwnMessage && (
          <Text style={styles.senderName}>{message.sender.name}</Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}>
          {message.messageType === 'image' ? (
            <Image source={{ uri: message.message }} style={styles.messageImage} />
          ) : (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}>
              {message.message}
            </Text>
          )}
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
          ]}>
            {formatMessageTime(message.timestamp)}
            {isOwnMessage && (
              <Ionicons 
                name={message.isRead ? "checkmark-done" : "checkmark"} 
                size={12} 
                color={message.isRead ? "#0084FF" : "#999"}
                style={{ marginLeft: 4 }}
              />
            )}
          </Text>
        </View>
      </View>
    );
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.star}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={30}
              color={star <= rating ? "#FFD700" : "#DDD"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Support</Text>
        <TouchableOpacity 
          onPress={() => setRatingModalVisible(true)}
          style={styles.ratingButton}
        >
          <Ionicons name="star-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {loading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        
        <TouchableOpacity 
          onPress={sendMessage}
          disabled={sendingMessage || !newMessage.trim()}
          style={[
            styles.sendButton,
            (!newMessage.trim() || sendingMessage) && styles.sendButtonDisabled
          ]}
        >
          {sendingMessage ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Rating Modal */}
      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Rate Your Experience</Text>
            
            {renderStarRating()}
            
            <TextInput
              style={styles.commentInput}
              value={ratingComment}
              onChangeText={setRatingComment}
              placeholder="Add a comment (optional)"
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setRatingModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={submitRating}
                style={[styles.modalButton, styles.submitButton]}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  ratingButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    maxWidth: '80%',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    minWidth: 50,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#333',
  },
  messageImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    padding: 4,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default ChatScreen;