import {NewFriendSettings} from "@/components/organisms/NewFriendSettings";
import {createNewContactEntity, ReminderFrequency} from "@/repositories";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModalProvider,
    BottomSheetView
} from "@gorhom/bottom-sheet";
import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {Button, View, StyleSheet} from "react-native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {useContacts} from "./Contact.context";
import {useThemeColor} from "@/hooks/useThemeColor";
import {useColorSchemeOrDefault} from "@/hooks/useColorScheme";
import {Colors} from "@/constants/design/Colors";
import {router} from 'expo-router';
import {DateUtils} from "@/constants/DateUtils";

type BottomSheetContextProps = {
    showBottomSheet: (content: ReactNode) => void;
};

const BottomSheetContext = createContext<BottomSheetContextProps | null>(null);

export const useMyBottomSheet = () => {
    const context = useContext(BottomSheetContext);
    if (!context) throw new Error('Context should be defined');
    return context;
}

export const MyBottomSheetProvider = ({children}: { children: ReactNode }) => {
    const [contentToDisplay, setContentToDisplay] = useState<ReactNode | null>(null);
    const snapPoints = useMemo(() => ["50%", "60%", "80%"], []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const theme = useColorSchemeOrDefault();
    const {newContact, addNewFriend} = useContacts();

    const [contactBirthday, setContactBirthday] = useState<Date>(DateUtils.getBirthDateFromBirthday(newContact) ?? new Date());
    const [contactLastCheckIn, setContactLastCheckIn] = useState<Date>(new Date());

    const closeSheet = () => {
        bottomSheetRef.current?.close();
    };

    const [selectedFrequency, setSelectedFrequency] = useState<ReminderFrequency>("weekly");

    const showBottomSheet = (content: ReactNode) => {
        console.log('showing bottom sheet');
        setContentToDisplay(content);
        bottomSheetRef.current?.expand();
    };

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                style={[props.style]}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                pressBehavior="close"
            />
        ),
        []
    );

    const saveNewFriend = async () => {
        await addNewFriend(createNewContactEntity({
            contact: newContact,
            frequency: selectedFrequency,
            birthDate: contactBirthday,
            lastCheckin: contactLastCheckIn
        }));
        bottomSheetRef.current?.close();
        router.navigate('/(tabs)/profile');
    };

    const iconColor = useThemeColor("icon");
    const backgroundColor = useThemeColor("background");

    useEffect(() => {
        if (newContact) {
            bottomSheetRef.current?.expand();
        } else {
            bottomSheetRef.current?.close();
        }
    }, [newContact]);

    return (
        <BottomSheetContext.Provider value={{showBottomSheet}}>
            {children}
            <BottomSheet
                ref={bottomSheetRef}
                backdropComponent={renderBackdrop}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                style={[
                    {
                        backgroundColor,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    },
                ]}
                handleIndicatorStyle={{backgroundColor: iconColor}}
                backgroundStyle={{backgroundColor}}
                index={-1}
            >
                <BottomSheetView style={styles.contentContainer}>
                    {contentToDisplay}
                </BottomSheetView>
            </BottomSheet>
        </BottomSheetContext.Provider>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    bottomSheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        height: 100,
        padding: 10,
    },
    contentContainer: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
});