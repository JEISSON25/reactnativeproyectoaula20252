import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

export default function ChatRoom({ route, navigation }) {
  const chatId = route?.params?.chatId;
  const [messageContent, setMessageContent] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const textInputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    let unsubMessages = () => {};

    async function firstLoad() {
      try {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.exists()) {
          // create a minimal chat document so updates later won't fail
          try {
            // try to initialize with participants passed via route params if available
            const routeParticipants = route?.params?.participants;
            await setDoc(chatRef, {
              participants: Array.isArray(routeParticipants) ? routeParticipants : [],
              lastMessage: '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: auth.currentUser?.uid || null,
            }, { merge: true });
          } catch (cErr) {
            console.warn('Could not create missing chat doc on firstLoad', cErr);
          }
          // re-read after attempt to create
          const re = await getDoc(chatRef);
          setChatRoom(re.exists() ? { id: re.id, ...re.data() } : null);
        } else {
          setChatRoom({ id: chatDoc.id, ...chatDoc.data() });
        }

        const messagesQuery = query(
          collection(db, 'chats', chatId, 'messages'),
          orderBy('createdAt', 'asc')
        );

        unsubMessages = onSnapshot(messagesQuery, (snap) => {
          const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setMessages(items);
        });
      } catch (e) {
        console.error('chat load error', e);
      } finally {
        setIsLoading(false);
      }
    }

    firstLoad();

    return () => {
      try { unsubMessages(); } catch (e) {}
    };
  }, [chatId]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => textInputRef.current?.focus(), 150);
    }
  }, [isLoading]);

  useEffect(() => {
    if (chatRoom && navigation?.setOptions) {
      navigation.setOptions({ title: chatRoom.title || 'Chat' });
    }
  }, [chatRoom]);

  const handleSendMessage = async () => {
    if (!chatId || !messageContent.trim()) return;
    const uid = auth.currentUser?.uid;
    const name = auth.currentUser?.displayName || auth.currentUser?.email || 'Usuario';

    const msg = {
      content: messageContent.trim(),
      senderId: uid || null,
      senderName: name,
      senderPhoto: null,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), msg);
      setMessageContent('');
      // update chat metadata
      const chatRef = doc(db, 'chats', chatId);
      try {
        await updateDoc(chatRef, {
          lastMessage: msg.content,
          updatedAt: serverTimestamp(),
        });
      } catch (uErr) {
        // If the chat document does not exist, create it (merge to avoid overwriting if partially present)
        console.warn('updateDoc failed, creating chat doc instead', uErr);
        try {
          await setDoc(chatRef, {
            lastMessage: msg.content,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
              participants: msg.senderId ? [msg.senderId] : [],
              createdBy: auth.currentUser?.uid || null,
          }, { merge: true });
        } catch (cErr) {
          console.error('failed to create chat doc after update failure', cErr);
        }
      }
      // scroll to bottom
      setTimeout(() => {
        listRef.current?.scrollToEnd?.({ animated: true });
      }, 150);
    } catch (e) {
      console.error('send message error', e);
    }
  };

  const renderItem = ({ item }) => {
    const isSender = item.senderId === auth.currentUser?.uid;
    return (
      <View style={[styles.messageRow, { alignSelf: isSender ? 'flex-end' : 'flex-start' }]}> 
        {!isSender && item.senderPhoto ? (
          <Image source={{ uri: item.senderPhoto }} style={styles.avatar} />
        ) : null}
        <View style={[styles.bubble, { backgroundColor: isSender ? '#007AFF' : '#333' }]}> 
          <Text style={styles.senderName}>{item.senderName}</Text>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.timeText}>{item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
        />

        <View style={styles.inputRow}>
          <TextInput
            ref={textInputRef}
            placeholder="Escribe un mensaje"
            placeholderTextColor="#000000ff"
            value={messageContent}
            onChangeText={setMessageContent}
            style={styles.input}
            multiline
          />
          <Pressable onPress={handleSendMessage} style={styles.sendButton}>
            <Text style={{ color: messageContent.trim() ? '#000000ff' : '#bbb' }}>Enviar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    maxWidth: '80%',
  },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  bubble: { padding: 10, borderRadius: 10 },
  senderName: { fontWeight: '600', marginBottom: 4, color: '#fff' },
  messageText: { color: '#fff' },
  timeText: { fontSize: 10, color: '#eee', textAlign: 'right', marginTop: 6 },
  inputRow: {
    borderTopWidth: 1,
    borderColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    color: '#000',
    paddingHorizontal: 10,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
