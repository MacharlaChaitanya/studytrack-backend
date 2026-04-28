/**
 * TabNavigator — Bottom Tab Navigation
 * Matches the bottom nav bar from Stitch HTML screens
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import InsightsScreen from '../screens/InsightsScreen';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isAddButton = route.name === 'AddTab';

        let iconName;
        switch (route.name) {
          case 'Home': iconName = isFocused ? 'home' : 'home-outline'; break;
          case 'Tasks': iconName = isFocused ? 'checkmark-done' : 'checkmark-done-outline'; break;
          case 'AddTab': iconName = 'add-circle'; break;
          case 'Stats': iconName = isFocused ? 'bar-chart' : 'bar-chart-outline'; break;
          case 'Insights': iconName = isFocused ? 'bulb' : 'bulb-outline'; break;
          default: iconName = 'ellipse-outline';
        }

        const label = route.name === 'AddTab' ? 'Add' : route.name;

        const onPress = () => {
          if (isAddButton) {
            navigation.navigate('AddSession');
            return;
          }
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.75}
            style={[
              styles.tab,
              isFocused && !isAddButton && styles.tabActive,
            ]}
          >
            <Ionicons
              name={iconName}
              size={isAddButton ? 32 : 22}
              color={
                isAddButton ? COLORS.accent :
                isFocused ? COLORS.primary : COLORS.secondary
              }
            />
            <Text style={[
              styles.tabLabel,
              isFocused && !isAddButton && styles.tabLabelActive,
              isAddButton && { color: COLORS.secondary },
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Dummy component for the Add tab (navigation happens via custom handler)
function AddTabPlaceholder() { return null; }

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="AddTab" component={AddTabPlaceholder} />
      <Tab.Screen name="Stats" component={AnalyticsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(107,107,107,0.1)',
    paddingTop: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.navBar,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.lg,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabLabel: {
    fontFamily: 'Manrope-Medium',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: COLORS.secondary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
});
