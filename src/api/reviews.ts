import { api } from './client';
import type { ReviewReply } from '@/types';

export function toggleReviewLove(reviewId: number) {
  return api.post<{ loved: boolean; loveCount: number }>(`/reviews/${reviewId}/love`).then((r) => r.data);
}

export function getReviewReplies(reviewId: number) {
  return api.get<ReviewReply[]>(`/reviews/${reviewId}/replies`).then((r) => r.data);
}

export function addReviewReply(reviewId: number, replyText: string) {
  return api.post<{ ok: true; replies: ReviewReply[] }>(`/reviews/${reviewId}/replies`, { replyText }).then((r) => r.data);
}
