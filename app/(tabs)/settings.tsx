import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Pressable, StyleSheet, View, useColorScheme } from "react-native";

const styles = StyleSheet.create({
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
