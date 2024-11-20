import {Button, StyleSheet, Text, TextInput, View} from "react-native";
import {useColorSchemeOrDefault, ColorSchemeName} from "@/hooks/useColorScheme";
import Toast from "react-native-root-toast";
import {Colors, Palette} from "@/constants/design";
import {ThemedText} from "@/components/atoms/ThemedText";
import {PrimaryButton} from "@/components/atoms/PrimaryButton";
import {SecondaryButton} from "@/components/atoms/SecondaryButton";
import {ContactModel} from "@/repositories";
import {useNewNoteCheckInModalControl, useSetContactToCheckin} from "@/store/CheckinNote.store";
import {useEffect, useRef, useState} from "react";
import {TimeConstants} from "@/constants/Time";
import {useCheckIns} from "@/contexts/CheckIns.context";

export type CheckInToastProps = {
    checkedInContact: ContactModel,
    isVisible?: boolean,
}

export const CheckInToast = ({checkedInContact, isVisible}: CheckInToastProps) => {
    const theme: ColorSchemeName = useColorSchemeOrDefault();
    const [userWantsToAddNote, setUserWantsToAddNote] = useState(false);
    const userWantsToAddNoteRef = useRef(userWantsToAddNote);
    const styles = makeStyles(theme);
    const {openModal, isModalVisible} = useNewNoteCheckInModalControl();
    const setContactToCheckin = useSetContactToCheckin();
    const {checkInOnContact} = useCheckIns();

    const addNote = () => {
        setUserWantsToAddNote(true);
        userWantsToAddNoteRef.current = true;
        openModal();
    }

    const undoContactCheckin = () => {
        setContactToCheckin(null);
    }

    const isCheckinVisible = (isVisible && !isModalVisible) ?? true;

    useEffect(() => {
        if (isCheckinVisible) {
            const timeout = setTimeout(() => {
                if (!userWantsToAddNoteRef.current) {
                    checkInOnContact();
                }
            }, TimeConstants.CONFIRM_CHECKIN_DELAY);
            return () => clearTimeout(timeout);
        }
    }, [isCheckinVisible]);

    return (
        <>
            <Toast
                visible={isCheckinVisible}
                position={650}
                shadow={false}
                animation={true}
                containerStyle={styles.toast}
                hideOnPress={false}
            >
                <View style={styles.container}>
                    <View style={{flex: 1}}>
                        <ThemedText style={{color: Palette.GREY_300, fontSize: 13}} type={'default'}>
                            Checked in with
                        </ThemedText>
                        <ThemedText numberOfLines={1} ellipsizeMode={'tail'}
                                    style={{fontFamily: 'SF Pro', fontSize: 16}}
                                    type={'subtitle'}>
                            {checkedInContact.firstName} {checkedInContact.lastName}
                        </ThemedText>
                    </View>
                    <View style={{flexDirection: 'row', gap: 5, flex: 1}}>
                        <SecondaryButton title={"Undo"} onPress={undoContactCheckin}/>
                        <PrimaryButton title={"+ Note"} onPress={addNote}/>
                    </View>
                </View>
            </Toast>
        </>
    );
}

const makeStyles = (theme: ColorSchemeName) => StyleSheet.create({
    toast: {
        backgroundColor: Colors[theme].toastBackground,
        flexWrap: 'nowrap',
        flexGrow: 1,
        flex: 1,
        borderRadius: 8,
        width: 360,
        height: 70,
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
});