import { ThemedText } from "@/components/atoms/ThemedText";
import { FontAwesome6 } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import * as Contacts from "expo-contacts";
import { Colors } from "@/constants/design/Colors";
import { useColorSchemeOrDefault } from "@/hooks/useColorScheme";
import { usePathname } from "expo-router";
import { useToggleAdminMode } from "@/store/Admin.store";
import { useNewFriendStore } from "@/store/NewFriend.store";

const usePageTitle = () => {
  const pathname = usePathname();
  switch (pathname) {
    case "/":
      return "Journal";
    case "/profile":
      return "Catchup";
    case "/settings":
      return "Settings";
    default:
      return "Catchup";
  }
};

export const Header = () => {
  const pageTitle = usePageTitle();
  const theme = useColorSchemeOrDefault();
  const toggleAdminMode = useToggleAdminMode();
  const { setContact } = useNewFriendStore();

  const openModalToChoseContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission refusée");
      return;
    }
    let newCatchUp = await Contacts.presentContactPickerAsync();
    if (newCatchUp) {
      const res = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.ID, Contacts.Fields.Image],
      });
      newCatchUp = {
        ...newCatchUp,
        image: res.data.find((contact) => contact.id === newCatchUp?.id)?.image,
      };
      setContact(newCatchUp);
    }
  };

  return (
    <View style={{ backgroundColor: Colors[theme].background }}>
      <View
        style={[styles.header, { backgroundColor: Colors[theme].background }]}
      >
        <ThemedText
          type={"subtitle"}
          style={{ fontSize: 24 }}
          suppressHighlighting
          onLongPress={toggleAdminMode}
        >
          {pageTitle}
        </ThemedText>
        {pageTitle === "Catchup" ? (
          <FontAwesome6
            size={40}
            suppressHighlighting
            color={Colors[theme].borderColor}
            onPress={openModalToChoseContact}
            name={"circle-plus"}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 50,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    height: 50,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});
