import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextField } from './Common';
import { Avatar } from './Avatar';
import { useAuth } from '@/auth/AuthContext';
import { apiErrorMessage } from '@/api/client';
import { formatDate } from '@/utils/format';
import { colors, radius, spacing } from '@/constants/theme';
import type { Review } from '@/types';

export function ReviewsSection({
  reviews,
  onSubmit,
}: {
  reviews: Review[];
  onSubmit: (rating: number, comment: string) => Promise<void>;
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
        reviews.map((r) => (
          <View key={r.id} style={styles.reviewRow}>
            <Avatar name={r.reviewerName} size={36} />
            <View style={{ flex: 1 }}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{r.reviewerName}</Text>
                <Text style={styles.reviewDate}>{r.date || formatDate(r.createdAt)}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginVertical: 2 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons key={i} name={i <= r.rating ? 'star' : 'star-outline'} size={12} color={colors.gold} />
                ))}
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          </View>
        ))
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
});
