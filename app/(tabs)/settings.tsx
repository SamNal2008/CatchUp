import {ThemedText} from "@/components/atoms/ThemedText";
import {Pressable, StyleSheet, View, Linking, AppState} from "react-native";
import {Colors, Spacing} from "@/constants/design";
import {Switch} from "react-native-gesture-handler";
import {useEffect, useRef, useState} from "react";
import {SymbolView} from "expo-symbols";
import {useColorSchemeOrDefault} from "@/hooks/useColorScheme";
import {useNotifications} from "@/hooks/useNotificatons";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        flexDirection: 'column',
        padding: Spacing.medium,
        gap: Spacing.medium,
    },
    categoryContainer: {
        gap: Spacing.small,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',

    },
});

type CategoryProps = {
    name: string;
    children: React.ReactNode;
};


const Category = ({name, children}: CategoryProps) => {
    const theme = useColorSchemeOrDefault();
    return (
        <View style={styles.categoryContainer}>
            <ThemedText type='subSectionTitle' style={{fontSize: 13}}>{name}</ThemedText>
            <View style={{
                width: '100%',
                height: 64,
                backgroundColor: Colors[theme].plainBackground,
                padding: 16,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row'
            }}>
                {children}
            </View>
        </View>
    );
}


export default function Settings() {
    const theme = useColorSchemeOrDefault();
    const [hasNotifications, setHasNotifications] = useState(false);
    const {hasNotificationEnabledOnPhone} = useNotifications();
    const refreshNotificationState = async () => {
        const hasNotificationEnabled = await hasNotificationEnabledOnPhone();
        setHasNotifications(hasNotificationEnabled);
    };

    useEffect(() => {
        refreshNotificationState();
    }, [hasNotificationEnabledOnPhone]);

    const handleChangeNotificationToggle = () => {
        if (!hasNotifications) {
            Linking.openSettings();
        }
    };

    const openFeedback = () => {
        const feedbackUrl =
            'https://lagrange-romain.notion.site/1351adc1e47f807c8213c84320bbdfc1?pvs=21';
        Linking.openURL(feedbackUrl).catch((err) =>
            console.error('Failed to open URL:', err)
        );
    }

    useEffect(() => {
        const subscription = AppState.addEventListener("change", refreshNotificationState);
        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <View style={[styles.container, {backgroundColor: Colors[theme].background}]}>
            <Category name={"Notifications"}>
                <ThemedText>Push notifications</ThemedText>
                <Switch value={hasNotifications} onChange={handleChangeNotificationToggle}/>
            </Category>
            <Pressable onPress={openFeedback}>
                <Category name={"Contact us"}>
                    <ThemedText>Send feedback</ThemedText>
                    <SymbolView name={'mail.fill'} tintColor={Colors[theme].tint} size={24}/>
                </Category>
            </Pressable>
        </View>
    );
}
