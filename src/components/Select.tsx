import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';

export interface SelectOption {
  label: string;
  value: string;
}

export function SelectField({
  value,
  options,
  onChange,
  placeholder = 'Select…',
  searchable,
}: {
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value);
  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options;

  return (
    <>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.value : styles.placeholder} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          {searchable ? (
            <TextInput
              placeholder="Search…"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              style={styles.search}
            />
          ) : null}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            style={{ maxHeight: 420 }}
            renderItem={({ item }) => (
              <Pressable
                style={styles.option}
                onPress={() => {
                  onChange(item.value);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <Text style={[styles.optionText, item.value === value && { color: colors.primary, fontWeight: '700' }]}>
                  {item.label}
                </Text>
                {item.value === value ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  value: { color: colors.text, fontSize: 14.5, flex: 1 },
  placeholder: { color: colors.textMuted, fontSize: 14.5, flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13 },
  optionText: { fontSize: 15, color: colors.text },
  separator: { height: 1, backgroundColor: colors.border },
});
