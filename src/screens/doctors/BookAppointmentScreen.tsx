import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Button, Field, TextField, LoadingView } from '@/components/Common';
import { SelectField } from '@/components/Select';
import { useAuth } from '@/auth/AuthContext';
import { getChamberAvailability, bookSerial } from '@/api/doctors';
import { apiErrorMessage } from '@/api/client';
import { formatDate } from '@/utils/format';
import { colors, radius, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BookAppointment'>;

export function BookAppointmentScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'BookAppointment'>>();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: dates, isLoading } = useQuery({
    queryKey: ['chamber-availability', params.chamberId],
    queryFn: () => getChamberAvailability(params.doctorId, params.chamberId, 30),
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onBook = async () => {
    if (!selectedDate) {
      Alert.alert('Pick a date', 'Choose an available appointment date.');
      return;
    }
    if (!patientName.trim() || !patientPhone.trim()) {
      Alert.alert('Missing information', 'Patient name and phone are required.');
      return;
    }
    setSubmitting(true);
    try {
      await bookSerial({
        chamberId: params.chamberId,
        date: selectedDate,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender: (patientGender || undefined) as 'male' | 'female' | 'other' | undefined,
        note: note.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['my-serials'] });
      Alert.alert('Appointment requested', 'You will be notified once the hospital confirms your serial.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not book', apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.subtitle}>
        {params.doctorName} · {params.organizationName}
      </Text>

      <Field label="Appointment date" required>
        {isLoading ? (
          <LoadingView />
        ) : !dates || dates.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>No available dates in the next 30 days.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {dates.map((d) => {
                const active = d.date === selectedDate;
                return (
                  <Pressable key={d.date} style={[styles.dateChip, active && styles.dateChipActive]} onPress={() => setSelectedDate(d.date)}>
                    <Text style={[styles.dateChipText, active && { color: '#fff' }]}>{formatDate(d.date)}</Text>
                    <Text style={[styles.dateChipSub, active && { color: '#fff' }]}>{d.remainingCapacity} slots left</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}
      </Field>

      <Field label="Patient name" required>
        <TextField value={patientName} onChangeText={setPatientName} placeholder="Full name" />
      </Field>
      <Field label="Patient phone" required>
        <TextField value={patientPhone} onChangeText={setPatientPhone} placeholder="01XXXXXXXXX" keyboardType="phone-pad" />
      </Field>
      <Field label="Patient age">
        <TextField value={patientAge} onChangeText={setPatientAge} placeholder="e.g. 32" keyboardType="number-pad" />
      </Field>
      <Field label="Patient gender">
        <SelectField
          value={patientGender}
          options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }]}
          onChange={setPatientGender}
          placeholder="Select gender"
        />
      </Field>
      <Field label="Note to the doctor / hospital">
        <TextField value={note} onChangeText={setNote} placeholder="Optional" multiline numberOfLines={3} style={{ minHeight: 72, textAlignVertical: 'top' }} />
      </Field>

      <Button title="Confirm booking" onPress={onBook} loading={submitting} style={{ marginTop: spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 13.5, color: colors.textMuted, marginBottom: spacing.md },
  dateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 110,
  },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateChipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  dateChipSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
