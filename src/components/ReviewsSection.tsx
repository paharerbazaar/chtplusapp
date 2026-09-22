import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Button, TextField } from './Common';
import { Avatar } from './Avatar';
import { VerifiedBadge } from './VerifiedBadge';
import { useAuth } from '@/auth/AuthContext';
import { apiErrorMessage } from '@/api/client';
import { toggleReviewLove, getReviewReplies, addReviewReply } from '@/api/reviews';
import { formatDate } from '@/utils/format';
import { colors, radius, spacing } from '@/constants/theme';
import type { Review } from '@/types';

function ReviewRow({ review, onChanged }: { review: Review; onChanged: () => void }) {
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loving, setLoving] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const repliesQuery = useQuery({
    queryKey: ['review-replies', review.id],
    queryFn: () => getReviewReplies(review.id),
    enabled: expanded,
  });

  const onLove = async () => {
    if (!isAuthenticated) {
      Alert.alert('Log in required', 'Please log in to react to reviews.');
      return;
    }
    if (loving) return;
    setLoving(true);
    try {
      await toggleReviewLove(review.id);
      onChanged();
    } catch (err) {
      Alert.alert('Could not react', apiErrorMessage(err));
    } finally {
      setLoving(false);
    }
  };

  const onToggleReplies = () => setExpanded((e) => !e);

  const onSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await addReviewReply(review.id, replyText.trim());
      setReplyText('');
      await repliesQuery.refetch();
      onChanged();
    } catch (err) {
      Alert.alert('Could not post reply', apiErrorMessage(err));
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <View style={styles.reviewRow}>
      <Avatar name={review.reviewerName} size={36} />
      <View style={{ flex: 1 }}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewerName}>
            {review.reviewerName}
            <VerifiedBadge active={review.reviewerBlueBadge} size={12} />
          </Text>
          <Text style={styles.reviewDate}>{review.date || formatDate(review.createdAt)}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons key={i} name={i <= review.rating ? 'star' : 'star-outline'} size={12} color={colors.gold} />
          ))}
        </View>
        <Text style={styles.reviewComment}>{review.comment}</Text>

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionBtn} onPress={onLove} disabled={loving} hitSlop={8}>
            <Ionicons
              name={review.lovedByMe ? 'heart' : 'heart-outline'}
              size={16}
              color={review.lovedByMe ? colors.danger : colors.textMuted}
            />
            <Text style={[styles.actionText, review.lovedByMe ? { color: colors.danger, fontWeight: '700' } : null]}>
              {review.loveCount > 0 ? `Love (${review.loveCount})` : 'Love'}
            </Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={onToggleReplies} hitSlop={8}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
            <Text style={styles.actionText}>{review.replyCount > 0 ? `Replies (${review.replyCount})` : 'Reply'}</Text>
          </Pressable>
        </View>

        {expanded ? (
          <View style={styles.repliesBlock}>
            {repliesQuery.isLoading ? (
              <Text style={styles.mutedSmall}>Loading replies…</Text>
            ) : (
              (repliesQuery.data || []).map((reply) => (
                <View key={reply.id} style={styles.replyRow}>
                  <Avatar uri={reply.userPhotoUrl} name={reply.userName} size={26} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.replyName}>
                      {reply.userName}
                      <VerifiedBadge active={reply.userBlueBadge} size={11} />
                    </Text>
                      <Text style={styles.reviewDate}>{reply.date || formatDate(reply.createdAt)}</Text>
                    </View>
                    <Text style={styles.replyText}>{reply.replyText}</Text>
                  </View>
                </View>
              ))
            )}

            {isAuthenticated ? (
              <View style={styles.replyComposer}>
                <TextField
                  placeholder="Write a reply…"
                  value={replyText}
                  onChangeText={setReplyText}
                  style={styles.replyInput}
                />
                <Pressable
                  style={[styles.replySend, (!replyText.trim() || submittingReply) && { opacity: 0.4 }]}
                  onPress={onSubmitReply}
                  disabled={!replyText.trim() || submittingReply}
                  hitSlop={8}
                >
                  <Ionicons name="send" size={17} color={colors.primary} />
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function ReviewsSection({
  reviews,
  onSubmit,
  onReviewsChanged,
}: {
  reviews: Review[];
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onReviewsChanged?: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!comment.trim()) {
      Alert.alert('Add a comment', 'Please write a short review.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
      setComment('');
      setRating(5);
    } catch (err) {
      Alert.alert('Could not submit review', apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}</Text>

      {isAuthenticated ? (
        <View style={styles.form}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Pressable key={i} onPress={() => setRating(i)} hitSlop={6}>
                <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={26} color={colors.gold} />
              </Pressable>
            ))}
          </View>
          <TextField
            placeholder="Share your experience…"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            style={{ minHeight: 72, textAlignVertical: 'top' }}
          />
          <Button title="Post review" onPress={submit} loading={submitting} style={{ marginTop: spacing.sm }} />
        </View>
      ) : null}

      {reviews.length === 0 ? (
        <Text style={styles.empty}>No reviews yet.</Text>
      ) : (
        reviews.map((r) => <ReviewRow key={r.id} review={r} onChanged={onReviewsChanged || (() => {})} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
  heading: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  form: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  starsRow: { flexDirection: 'row', gap: 4, marginBottom: spacing.sm },
  empty: { color: colors.textMuted, fontSize: 13 },
  reviewRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewerName: { fontWeight: '700', fontSize: 13.5, color: colors.text },
  reviewDate: { fontSize: 11, color: colors.textMuted },
  reviewComment: { fontSize: 13.5, color: colors.text, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  repliesBlock: {
    marginTop: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    gap: spacing.sm,
  },
  mutedSmall: { fontSize: 12, color: colors.textMuted },
  replyRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start' },
  replyName: { fontWeight: '700', fontSize: 12.5, color: colors.text },
  replyText: { fontSize: 12.5, color: colors.text, marginTop: 1 },
  replyComposer: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', marginTop: 2 },
  replyInput: { flex: 1, paddingVertical: 8, fontSize: 13 },
  replySend: { padding: 6 },
});
