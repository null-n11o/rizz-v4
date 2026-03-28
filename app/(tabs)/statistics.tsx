import React from 'react';
import { ScrollView, StyleSheet, RefreshControl, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import PeriodSelector from '@/components/statistics/PeriodSelector';
import DateNavigator from '@/components/statistics/DateNavigator';
import SummaryCards from '@/components/statistics/SummaryCards';
import StatsBarChart from '@/components/statistics/StatsBarChart';
import StatsLineChart from '@/components/statistics/StatsLineChart';
import { useStatistics } from '@/contexts/StatisticsContext';

export default function StatisticsScreen() {
  const { t } = useTranslation();
  const {
    period,
    setPeriod,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    stats,
    isLoading,
    error,
    refresh,
  } = useStatistics();

  const handlePrev = () => {
    if (period === 'daily') {
      if (selectedMonth === 1) {
        setSelectedYear(selectedYear - 1);
        setSelectedMonth(12);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else if (period !== 'yearly') {
      setSelectedYear(selectedYear - 1);
    }
  };

  const handleNext = () => {
    if (period === 'daily') {
      if (selectedMonth === 12) {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    } else if (period !== 'yearly') {
      setSelectedYear(selectedYear + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#C09E5C" />
        }
      >
        <ThemedText type="title" style={styles.title}>
          {t('statistics.title')}
        </ThemedText>

        <PeriodSelector selected={period} onSelect={setPeriod} />

        {period !== 'yearly' && (
          <DateNavigator
            period={period}
            year={selectedYear}
            month={selectedMonth}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : isLoading ? (
          <ThemedText style={styles.loadingText}>{t('statistics.loading')}</ThemedText>
        ) : stats.length === 0 ? (
          <ThemedText style={styles.emptyText}>{t('statistics.noData')}</ThemedText>
        ) : (
          <>
            <SummaryCards stats={stats} />
            <StatsBarChart stats={stats} />
            <StatsLineChart stats={stats} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F23',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    color: '#C09E5C',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#1F1F2E',
    borderRadius: 8,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 32,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
  },
});
