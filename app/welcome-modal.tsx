import { PrimaryButton } from "@/components";
import { ThemedText } from "@/components/atoms/ThemedText";
import { HelloWave } from "@/components/HelloWave";
import { Spacing } from "@/constants/design";
import { Colors, Palette } from "@/constants/design/Colors";
import { DARK, useColorSchemeOrDefault } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import { SFSymbol, SymbolView } from "expo-symbols";
import { ScrollView, StyleSheet, View } from "react-native";

const CatchUpIntro = () => {
  return (
    <View style={styles.intro}>
      <HelloWave />
      <ThemedText style={{ fontSize: 40, fontWeight: "bold", paddingTop: 40 }}>
        Catch’up
      </ThemedText>
      <ThemedText
        style={{ paddingHorizontal: Spacing.large, color: Palette.GREY_300 }}
      >
        Add friends to stay in touch, share memories, and never miss a birthday
      </ThemedText>
    </View>
  );
};

const CatchUpPurpose = ({
  content,
  title,
  icon,
}: {
  title: string;
  content: string;
  icon: SFSymbol;
}) => {
  const theme = useColorSchemeOrDefault();
  return (
    <View style={styles.purposeSummary}>
      <View style={styles.iconContainer}>
        <SymbolView
          style={[
            styles.purposeSymbol,
            theme === DARK
              ? styles.purposeSymbolDark
              : styles.purposeSymbolLight,
          ]}
          name={icon}
          tintColor={
            theme === DARK
              ? Palette.WHITE
              : Colors.light.buttonBackgroundDisabled
          }
        />
      </View>
      <View>
        <ThemedText>{title}</ThemedText>
        <ThemedText style={{ fontWeight: "medium", color: Palette.GREY_300 }}>
          {content}
        </ThemedText>
      </View>
    </View>
  );
};

const CatchUpPurposes = () => {
  return (
    <View style={styles.purposes}>
      <CatchUpPurpose
        icon="bell"
        content="Catch’up your friends at the right moment."
        title="Reminder"
      />
      <CatchUpPurpose
        icon="gift"
        content="Never miss a friend’s birthday again. "
        title="Birthday"
      />
    </View>
  );
};

export default function WelcomeModal() {
  const navigateToHomePage = () => {
    router.dismiss();
  };

  return (
    <ScrollView contentContainerStyle={styles.modal}>
      <CatchUpIntro />
      <CatchUpPurposes />
      <PrimaryButton
        title={"Get started"}
        textStyle={styles.buttonTextStyle}
        style={styles.buttonStyle}
        onPress={navigateToHomePage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: Spacing.medium,
  },
  intro: {
    gap: Spacing.medium,
    alignItems: "center",
  },
  purposes: {
    flexDirection: "column",
    justifyContent: "space-around",
    gap: Spacing.medium,
  },
  buttonTextStyle: {
    fontSize: 16,
  },
  buttonStyle: {
    marginTop: 100,
    width: "90%",
    height: 50,
    borderRadius: 16,
  },
  purposeSummary: {
    flexDirection: "row",
    gap: Spacing.small,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  purposeSymbol: {
    width: 24,
    height: 24,
    padding: 8,
    borderRadius: 8,
  },
  purposeSymbolLight: {
    backgroundColor: Palette.GREY_100,
  },
  purposeSymbolDark: {
    backgroundColor: "transparent",
  },
});
