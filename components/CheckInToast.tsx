import {StyleSheet, Text, View} from "react-native";
import React, {useEffect} from "react";
import {useColorSchemeOrDefault, ColorSchemeName} from "@/hooks/useColorScheme";
import Toast from "react-native-root-toast";
import {Colors, Palette} from "@/constants/design";
import {ThemedText} from "@/components/ThemedText";
import {PrimaryButton} from "@/components/PrimaryButton";
import {SecondaryButton} from "@/components/SecondaryButton";
import {ContactModel} from "@/repositories";

export type CheckInToastProps = {
    isVisible: boolean,
    checkedInContact: ContactModel
}

export const CheckInToast = ({isVisible, checkedInContact}: CheckInToastProps) => {
    const theme: ColorSchemeName = useColorSchemeOrDefault();
    const styles = makeStyles(theme);

    const addNote = () => console.log('Adding notes');
    const cancelCheckin = () => console.log('Cancelling checkin');

    return (
        <Toast
            visible={isVisible}
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
                    <ThemedText numberOfLines={1} ellipsizeMode={'tail'} style={{fontFamily: 'SF Pro', fontSize: 16}} type={'subtitle'}>
                        {checkedInContact.firstName} {checkedInContact.lastName} NALBANDIAN
                    </ThemedText>
                </View>
                <View style={{flexDirection: 'row', gap: 5}}>
                    <SecondaryButton title={"Undo"} onPress={cancelCheckin} />
                    <PrimaryButton title={"+ Note"} onPress={addNote}/>
                </View>
            </View>
        </Toast>
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
        justifyContent: 'center'
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Palette.BLACK
    }
});