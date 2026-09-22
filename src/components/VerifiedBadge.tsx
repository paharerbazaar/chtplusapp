import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const BADGE_BLUE = '#2196F3';

// Small blue checkmark shown next to a name when that account's blue badge
// (admin-granted, see the backend's /admin/blue-badge) is currently active.
// Renders nothing when inactive, so callers can pass the flag unconditionally.
export function VerifiedBadge({ active, size = 14 }: { active?: boolean; size?: number }) {
  if (!active) return null;
  return <Ionicons name="checkmark-circle" size={size} color={BADGE_BLUE} style={{ marginLeft: 4 }} />;
}
