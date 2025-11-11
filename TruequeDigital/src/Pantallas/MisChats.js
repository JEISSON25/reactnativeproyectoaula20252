import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

export default function MisChats({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      setChats([]);
      return;
    }

    // listen for chats where current user is a participant, ordered by updatedAt desc
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', uid),
      orderBy('updatedAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setChats(items);
      setLoading(false);
    }, (err) => {
      console.error('MisChats onSnapshot error', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const renderItem = ({ item }) => {
    const uid = auth.currentUser?.uid;
    // determine other participant id and name (for 1:1 chats)
    const participants = item.participants || [];
    const otherId = participants.find((p) => p !== uid) || null;
    let title = item.title || '';
    if (!title) {
      const names = item.participantNames || {};
      if (otherId && names[otherId]) title = names[otherId];
      else if (Object.values(names).length) title = Object.values(names).filter(Boolean).join(', ');
      else title = 'Chat';
    }

    return (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() => navigation.navigate('ChatRoom', { chatId: item.id })}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.last}>{item.lastMessage || 'Sin mensajes aún'}</Text>
        </View>
        <Text style={styles.time}>{item.updatedAt?.toDate ? new Date(item.updatedAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {chats.length === 0 ? (
        <View style={{ padding: 16 }}>
          <Text style={{ textAlign: 'center' }}>No tienes chats todavía.</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  title: { fontSize: 16, fontWeight: '600' },
  last: { color: '#666', marginTop: 4 },
  time: { marginLeft: 8, color: '#999', fontSize: 12 },
});
