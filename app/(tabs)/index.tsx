import {Button, StyleSheet, Text, View} from "react-native";
import { ThemedText } from "@/components/atoms/ThemedText";
import { ThemedView } from "@/components/atoms/ThemedView";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';
import Toast from "react-native-root-toast";
import {Palette} from "@/constants/design";
import {useMyBottomSheet} from "@/contexts/BottomSheetProvider.context";

export default function HomeScreen() {
  const {showBottomSheet} = useMyBottomSheet();
  const isFirstLaunch = async () => {
    const firstLaunch = await AsyncStorage.getItem("FIRST_LAUNCH");
    await AsyncStorage.setItem("FIRST_LAUNCH", "false");
    return firstLaunch === null;
  }

  const redirectToWelcomeModalIfFirstConnection = async () => {
    const firstLaunch = await isFirstLaunch();
    console.log('First launch :' + firstLaunch);
    if (firstLaunch) {
      router.navigate('/welcome-modal');
      return;
    }
  }

  useEffect(() => {
    redirectToWelcomeModalIfFirstConnection();
  }, []);

  return (
    <ThemedView>
      <View style={[styles.container]}>
        <ThemedText type={"subtitle"}>
          Keep your closest within reach
        </ThemedText>
        <ThemedText type={"default"} style={{ textAlign: "center" }}>
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
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  }
});
