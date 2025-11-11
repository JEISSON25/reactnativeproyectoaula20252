import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { db, auth } from '../../firebaseConfig';


export default function Chat ({ route }) {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState(null);
  const flatListRef = useRef(null);
 
  const userAuth = auth.currentUser;
  const chatId = route?.params?.chatId ?? 'global';

  const messagesCollection = (chatId) => collection(doc(db, 'chats', chatId), 'messages');

  useEffect(() => {
    const q = query(messagesCollection(chatId), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMensajes(msgs);
      setLoading(false);
    }, (err) => {
      console.error('chat onSnapshot error', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [chatId]);

  const handleSend = async () => {
    if (!userAuth) return alert('Debes iniciar sesión para enviar mensajes');
    const text = nuevoMensaje.trim();
    if (!text) return;

    try {
      await addDoc(messagesCollection(chatId), {
        text,
        userId: userAuth.uid,
        userName: nombre || 'Anónimo',
        createdAt: serverTimestamp(),
      });
      setNuevoMensaje('');
      // scroll to end after a short delay
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (e) {
      console.error('send message error', e);
      alert('Error al enviar mensaje');
    }
  };

  useEffect(() => {
    if (!userAuth) return;
    let mounted = true;
    (async () => {
      try {
        const ref = doc(db, 'usuarios', userAuth.uid);
        const snapshot = await getDoc(ref);
        if (mounted && snapshot.exists()) {
          const data = snapshot.data();
          setNombre(data.nombre || null);
        }
      } catch (err) {
        console.error('error encontrando el nombre del julano', err);
      }
    })();
    return () => { mounted = false; };
  }, [userAuth]);

  return (
    <View style={styles.container}>
      
      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={item.userId === userAuth?.uid ? styles.myMessage : styles.theirMessage}>
            <Text style={styles.userName}>{item.userName}:</Text>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={nuevoMensaje}
          onChangeText={setNuevoMensaje}
          placeholder="Escribe tu mensaje..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={{ color: '#fff' }}>Enviar</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },

  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    maxWidth: '80%',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    maxWidth: '80%',
  },
  userName: { fontWeight: 'bold', marginBottom: 2 },
  messageText: { fontSize: 15 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 6,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
});