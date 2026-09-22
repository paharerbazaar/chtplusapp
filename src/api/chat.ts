import { api } from './client';
import type { ChatConversation, ChatMessage } from '@/types';

export function getConversations() {
  return api.get<ChatConversation[]>('/chat/conversations').then((r) => r.data);
}

export function startConversation(userId: string) {
  return api.post<{ conversationId: string }>('/chat/conversations', { userId }).then((r) => r.data);
}

export interface OtherUser {
  id: string;
  name: string;
  photoUrl: string | null;
}

export function getMessages(conversationId: string, afterId?: number) {
  return api
    .get<{ otherUser: OtherUser; messages: ChatMessage[] }>(`/chat/conversations/${conversationId}/messages`, {
      params: afterId ? { after: afterId } : undefined,
    })
    .then((r) => r.data);
}

export function sendMessage(conversationId: string, body: string) {
  return api.post<{ message: ChatMessage }>(`/chat/conversations/${conversationId}/messages`, { body }).then((r) => r.data);
}
