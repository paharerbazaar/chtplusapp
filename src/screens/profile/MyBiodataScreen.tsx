import React from 'react';
import { View, FlatList, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState } from '@/components/Common';
import { BiodataCard } from '@/components/cards/BiodataCard';
import { getMyBiodata } from '@/api/me';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MyBiodataScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['my-biodata'], queryFn: getMyBiodata });

  return (
    <Screen edges={['bottom']}>
      <Pressable style={styles.addRow} onPress={() => navigation.navigate('BiodataForm', {})}>
        <Ionicons name="add-circle" size={20} color={colors.primary} />
        <Text style={styles.addText}>Submit a new biodata</Text>
      </Pressable>

      {isLoading ? (
        <LoadingView />
      ) : !data || data.length === 0 ? (
        <EmptyState title="You haven't submitted a biodata yet" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(b) => b.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={{ padding: spacing.md }}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: spacing.sm }}>
              <BiodataCard biodata={item} onPress={() => navigation.navigate('BiodataDetail', { id: item.id })} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: spacing.md },
  addText: { color: colors.primary, fontWeight: '700' },
});
