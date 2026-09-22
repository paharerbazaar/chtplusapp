import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { TextField, LoadingView } from '@/components/Common';
import { getMessages, sendMessage } from '@/api/chat';
import { useAuth } from '@/auth/AuthContext';
import { formatDateTime } from '@/utils/format';
import { CHAT_POLL_INTERVAL_MS } from '@/constants/config';
import { colors, radius, spacing } from '@/constants/theme';
import type { ChatMessage } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

export function ConversationScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Conversation'>>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const lastIdRef = useRef<number | undefined>(undefined);

  // Polls GET .../messages?after=<lastId> on an interval (there's no
  // websocket on the backend) and appends whatever's new.
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await getMessages(params.conversationId, lastIdRef.current);
        if (cancelled) return;
        if (res.messages.length > 0) {
          lastIdRef.current = res.messages[res.messages.length - 1].id;
          setMessages((prev) => [...prev, ...res.messages]);
          queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
        }
      } catch {
        // transient network errors are fine to ignore on a poll loop
      } finally {
        setLoading(false);
      }
    };
    poll();
    const interval = setInterval(poll, CHAT_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [params.conversationId, queryClient]);

  const onSend = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setText('');
    try {
      const res = await sendMessage(params.conversationId, body);
      lastIdRef.current = res.message.id;
      setMessages((prev) => [...prev, res.message]);
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {loading && messages.length === 0 ? (
          <LoadingView />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={{ padding: spacing.md, gap: 8 }}
            renderItem={({ item }) => {
              const mine = item.senderId === user?.id;
              return (
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={mine ? styles.bubbleTextMine : styles.bubbleText}>{item.body}</Text>
                  <Text style={[styles.time, mine && { color: 'rgba(255,255,255,0.75)' }]}>{formatDateTime(item.createdAt)}</Text>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputBar}>
          <TextField
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            style={{ flex: 1 }}
            multiline
          />
          <Pressable style={styles.sendBtn} onPress={onSend} disabled={sending}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '78%', borderRadius: radius.md, padding: 10 },
  bubbleMine: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { color: colors.text, fontSize: 14 },
  bubbleTextMine: { color: '#fff', fontSize: 14 },
  time: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  inputBar: { flexDirection: 'row', gap: spacing.sm, padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'flex-end' },
  sendBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
});
