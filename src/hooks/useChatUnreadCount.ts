import { useQuery } from '@tanstack/react-query';
import { getChatUnreadCount } from '@/api/me';
import { useAuth } from '@/auth/AuthContext';
import { CHAT_LIST_POLL_INTERVAL_MS } from '@/constants/config';

export function useChatUnreadCount() {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: getChatUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: CHAT_LIST_POLL_INTERVAL_MS,
  });
  return data?.count ?? 0;
}
