import { StyleSheet, View, Button } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';

export default function HomeScreen() {
  const isFirstLaunch = async () => {
    const isFirstLaunch = await AsyncStorage.getItem("FIRST_LAUNCH");
    if (isFirstLaunch === null) {
      return true;
    }
    await AsyncStorage.setItem("FIRST_LAUNCH", "false");
    return false;
  }

  useEffect(() => {
    isFirstLaunch().then((firstLaunch) => {
      router.navigate(firstLaunch ? "/welcome-modal" : "/(tabs)");
    });
  }, []);

  return (
    <ThemedView>
      <View style={[styles.container]}>
        <ThemedText type={"subtitle"}>
          Keep your closest within reach
        </ThemedText>
        <ThemedText type={"default"}>
          Add friends to stay in touch, share memories, and never miss a
          birthday
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
  }
});
