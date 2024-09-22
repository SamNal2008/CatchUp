import {ThemedText} from "@/components/ThemedText";
import {AntDesign} from "@expo/vector-icons";
import {StyleSheet, View} from "react-native";

export const Header = () => {
    return (<View style={styles.header}>
        <ThemedText type={'defaultSemiBold'}>Catchup</ThemedText>
        <AntDesign size={28} onPress={() => console.log('tot')} name={'pluscircle'}/>
    </View>);
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '100%',
    },
});