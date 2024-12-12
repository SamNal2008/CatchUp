import { ThemedText } from "@/components/atoms/ThemedText";
import { MyBottomSheet, useModalRef } from "@/components/navigation/BottomSheet";
import { Colors } from "@/constants/design";
import { useCheckIns } from "@/contexts/CheckIns.context";
import {ColorSchemeName, useColorSchemeOrDefault} from "@/hooks/useColorScheme";
import { logService } from "@/services/log.service";
import {
    useNewCheckinInfo,
    useNewNoteCheckInModalControl,
    useSetContactToCheckin,
    useSetNoteContent,
    useSetNoteDate
} from "@/store/CheckinNote.store";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useEffect, useRef, useState } from "react";
import { Button, TextInput, View } from "react-native";


type NewNoteHeaderProps = {
    saveNewCheckinWithNote: () => void;
}

const NewNoteHeader = ({saveNewCheckinWithNote}: NewNoteHeaderProps) => {
    const theme = useColorSchemeOrDefault();
    const {checkinDate, contactToCheckin} = useNewCheckinInfo();
    const setContactToCheckin = useSetContactToCheckin();
    const setCheckinDate = useSetNoteDate();
    const {closeModal} = useNewNoteCheckInModalControl();

    const updateCheckinDate = (event: DateTimePickerEvent) => {
        logService.log(new Date(event.nativeEvent.timestamp));
        setCheckinDate(new Date(event.nativeEvent.timestamp));
    }

    const cancelCheckin = () => {
        setContactToCheckin(null);
        closeModal();
    }

    return (<>
        <Button title="Cancel" color={Colors[theme].buttonBackground} onPress={cancelCheckin}/>
        <View>
            <DateTimePicker
                value={checkinDate}
                onChange={updateCheckinDate}
            />
            <ThemedText>
                with {contactToCheckin?.firstName} {contactToCheckin?.lastName?.toUpperCase()}
            </ThemedText>
        </View>
        <Button title="Save" color={Colors[theme].buttonBackground} onPress={saveNewCheckinWithNote}/>
    </>);
}

const NewNoteTextInput = () => {
    const theme = useColorSchemeOrDefault();
    const {noteContent} = useNewCheckinInfo()
    const setNoteContent = useSetNoteContent();
    const {isModalVisible} = useNewNoteCheckInModalControl();
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    const styles = makeStyles(theme);

    useEffect(() => {
        if (isModalVisible) {
            inputRef.current?.focus();
            setIsFocused(true);
        } else {
            inputRef.current?.blur();
            setIsFocused(false);
        }
    }, [isModalVisible]);
    return (
        <View style={{flex: 1, padding: 10}}>
            <TextInput
                autoFocus={isFocused}
                ref={inputRef}
                value={noteContent}
                onChangeText={setNoteContent}
                style={styles.textInput}
                numberOfLines={10}
                multiline
            />
        </View>
    )
}

export const NewNoteModal = () => {
    const modalRef = useModalRef();
    const {isModalVisible, closeModal} = useNewNoteCheckInModalControl();
    const {checkInOnContact} = useCheckIns();
    const {contactToCheckin} = useNewCheckinInfo();

    useEffect(() => {
        console.log('isModalVisible', isModalVisible);
        if (isModalVisible) {
            modalRef.current?.expand();
        } else {
            modalRef.current?.close();
        }
    }, [isModalVisible]);

    const saveNewCheckinWithNote = () => {
        if (!contactToCheckin) {
            logService.warn('No contact to checkin with');
            return;
        }
        checkInOnContact();
        closeModal();
    };

    return (
        <MyBottomSheet
            contentToDisplay={<NewNoteTextInput/>}
            header={<NewNoteHeader saveNewCheckinWithNote={saveNewCheckinWithNote}/>}
            ref={modalRef}
        />
    );
}

const makeStyles = (theme: ColorSchemeName) => ({
    textInput: {
        backgroundColor: Colors[theme].textInput,
        padding: 20,
        color: Colors[theme].text,
        lineHeight: 20,
        borderRadius: 8,
        flex: 2
    }
});