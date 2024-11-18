import { ThemedText } from "@/components/atoms/ThemedText";
import { ThemedView } from "@/components/atoms/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Pressable, StyleSheet, View, useColorScheme, Text, Switch, TouchableOpacity, Linking } from "react-native";
import React, { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

// Type pour le statut des permissions
type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

const SettingsScreen: React.FC = () => {
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(false);

  // Vérification des permissions au montage
  useEffect(() => {
    const checkNotificationPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setIsPushEnabled(status === 'granted');
    };
    checkNotificationPermissions();
  }, []);

  // Gestion du toggle
  const handleToggle = async () => {
    if (!isPushEnabled) {
      // Rediriger vers les paramètres si les notifications ne sont pas activées
      await Linking.openSettings();
      const { status } = await Notifications.getPermissionsAsync();
      setIsPushEnabled(status === 'granted');
    } else {
      // Désactivation des notifications (mettre à jour la logique backend si nécessaire)
      setIsPushEnabled(false);
    }
  };

  // Gestion du clic sur le bouton de feedback
  const handleFeedback = () => {
    const feedbackUrl =
      'https://lagrange-romain.notion.site/1351adc1e47f807c8213c84320bbdfc1?pvs=21';
    Linking.openURL(feedbackUrl).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Push notifications</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isPushEnabled ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={handleToggle}
            value={isPushEnabled}
          />
        </View>
      </View>

      {/* Feedback */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Contact Us</Text>
        <TouchableOpacity style={styles.row} onPress={handleFeedback}>
          <Text style={styles.rowLabel}>Send Feedback</Text>
          <Ionicons name="mail-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  rowLabel: {
    fontSize: 16,
  },
});

export default SettingsScreen;

/*const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
    paddingTop: 30,
    gap: 20,
  },
  removeAddButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  removeAddButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  categoryContainer: {
    marginTop: 20,
  },
  categoryTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
});

type CategoryProps = {
  name: string;
  children: React.ReactNode;
};

const Category = ({ name, children }: CategoryProps) => (
  <View style={styles.categoryContainer}>
    <ThemedText style={styles.categoryTitle}>{name}</ThemedText>
    {children}
  </View>
);

const User = () => {
    const textColor = useThemeColor('tint');
  return (
    <View>
      <ThemedText>Username: user123</ThemedText>
      <ThemedText>
        Email:
        <ThemedText style={{ color: textColor, textDecorationLine: "underline" }}>
          Test@email.com
        </ThemedText>
      </ThemedText>
    </View>
  );
};

const Account = () => (
  <View>
    <ThemedText>Account type: Free</ThemedText>
    <ThemedText>Account status: Active</ThemedText>
  </View>
);

const Appearance = () => {
  const theme = useColorScheme();
  return (
    <View>
      <ThemedText>Theme: {theme}</ThemedText>
      <ThemedText>Font size: Medium</ThemedText>
    </View>
  );
};

export default function Settings() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings page</ThemedText>
      <Pressable style={styles.removeAddButton}>
        <ThemedText style={styles.removeAddButtonText}>
          Remove adds ⊖
        </ThemedText>
      </Pressable>
      <View style={{ alignSelf: "baseline" }}>
        <Category name="User">
          <User />
        </Category>
        <Category name="Account">
          <Account />
        </Category>
        <Category name="Appearance">
          <Appearance />
        </Category>
        <Category name="Notifications">
          <ThemedText>Receive notifications</ThemedText>
        </Category>
        <Category name="Privacy">
          <ThemedText>Privacy policy</ThemedText>
        </Category>
        <Category name="Support">
          <ThemedText>Help</ThemedText>
        </Category>
      </View>
    </ThemedView>
  );
}
*/