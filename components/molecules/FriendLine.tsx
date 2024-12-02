import {useCheckIns} from "@/contexts/CheckIns.context";
import {useContacts} from "@/contexts/Contact.context";
import {useNotifications} from "@/hooks/useNotificatons";
import {ContactModel} from "@/repositories";
import {useNewCheckinInfo, useSetContactToCheckin} from "@/store/CheckinNote.store";
import {SymbolView} from "expo-symbols";
import {useEffect, useState} from "react";
import {Alert, Image, Pressable, StyleSheet, View} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import {PrimaryButton} from "@/components";
import {ThemedText} from "../atoms/ThemedText";
import {CheckInToast} from "../organisms/CheckInToast";
import {InitialImage} from "./InitialImage";
import Reanimated, {SharedValue, useAnimatedStyle} from "react-native-reanimated";
import {Palette} from "@/constants/design";

type RightActionProps = {
    onPress: () => void;
    progress: SharedValue<number>;
    drag: SharedValue<number>;
}


const RightAction = ({drag, onPress, progress}: RightActionProps) => {
    const styleAnimation = useAnimatedStyle(() => {
        return {
            transform: [{translateX: drag.value + 50}],
            opacity: progress.value,
            backgroundColor: Palette.RED,
            marginRight: -100,
            width: 100
        };
    });

    return (
        <Reanimated.View style={[deleteStyles.container, styleAnimation]}>
            <View style={deleteStyles.actionContainer}>
                <Pressable onPress={onPress}>
                    <SymbolView name="trash.fill" size={32} tintColor={Palette.WHITE}/>
                </Pressable>
            </View>
        </Reanimated.View>
    );
};


const deleteStyles = StyleSheet.create({
    container: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContainer: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export const FriendLine = ({contact}: { contact: ContactModel }) => {
    const {deleteFriend, friends} = useContacts();
    const {getLatestCheckInForContact} = useCheckIns();
    const {askForNotificationPermission} = useNotifications();

    const [isOnDeleteMode, setIsOnDeleteMode] = useState<boolean>(false);
    const toggleDeleteFriend = () => {
        setIsOnDeleteMode((prev) => !prev);
    };

    const [lastCheckedIn, setLastCheckedIn] = useState<Date | null>(null);
    const [reload, setReload] = useState<boolean>(false);
    const setContactToCheckin = useSetContactToCheckin();
    const {contactToCheckin} = useNewCheckinInfo();

    const isCheckingOnContact = contactToCheckin?.id === contact.id;

    useEffect(() => {
        if (friends.length > 0) {
            askForNotificationPermission();
        }
    }, []);

    const createThreeButtonAlert = () =>
        Alert.alert('Alert Title', 'My Alert Msg', [
            {
                text: 'Ask me later',
                onPress: () => console.log('Ask me later pressed'),
            },
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);

    useEffect(() => {
        if (isOnDeleteMode) {
            createThreeButtonAlert();
        }
    }, [isOnDeleteMode]);

    useEffect(() => {
        if (!contact.id) {
            return;
        }
        setLastCheckedIn(getLatestCheckInForContact(contact.id));
    }, [contact.id, reload]);

    const removeFriend = () => {
        if (!contact.id) {
            alert('Unable to delete friend without id');
            return;
        }
        deleteFriend(contact.id).then(r => {
            setReload((prev) => !prev);
        });
    }

    const checkInOnFriend = () => {
        if (!contact.id) {
            alert('Unable to check in on friend without id');
            return;
        }
        setContactToCheckin(contact);
    }

    const hasAlreadyCheckedIn = !!lastCheckedIn;

    const toDaysAgo = hasAlreadyCheckedIn ? Math.round((new Date().getTime() - lastCheckedIn?.getTime()) / (1000 * 3600 * 24)) : null;
    const hasCheckedInToday = hasAlreadyCheckedIn && toDaysAgo! < 1;

    return (
        <Swipeable renderRightActions={(progress, drag) => <RightAction drag={drag} progress={progress}
                                                                        onPress={toggleDeleteFriend}/>}>
            <View style={[styles.friendContainer]}>
                <View style={styles.friendNameContainer}>
                    {contact.image ?
                        <Image source={contact.image} style={styles.friendImage}/> :
                        <InitialImage firstName={contact.firstName} lastName={contact.lastName} size={50}/>}
                    <View>
                        <ThemedText style={styles.friendName}>{contact.firstName}</ThemedText>
                        {hasAlreadyCheckedIn ?
                            <ThemedText
                                type="subText">{hasCheckedInToday ? "Checked in today" : `Checked in ${toDaysAgo} days ago`}</ThemedText>
                            :
                            <ThemedText type="subText">Never checked in yet !</ThemedText>
                        }
                    </View>
                </View>
                <PrimaryButton disabled={hasCheckedInToday} title={hasCheckedInToday ? 'Come later' : 'Check In'}
                               onPress={checkInOnFriend}/>
                <CheckInToast checkedInContact={contact} isVisible={isCheckingOnContact}/>
            </View>
        </Swipeable>
    )
}

const styles = StyleSheet.create({
    friendNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    friendName: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    friendImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    friendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
});