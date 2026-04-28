/**
 * LoadingSpinner — Full-screen loading overlay
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../utils/theme';

export default function LoadingSpinner({ message }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.accent} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 40,
  },
  text: {
    ...FONTS.bodySm,
    color: COLORS.secondary,
    marginTop: 12,
  },
});
