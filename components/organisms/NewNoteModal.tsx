import {MyBottomSheet, useModalRef} from "@/components/navigation/BottomSheet";
import {useColorSchemeOrDefault} from "@/hooks/useColorScheme";
import {
    useContactToCheckin,
    useIsModalVisible, useNewNoteCheckInModalControl,
    useNoteContent,
    useCheckinDate,
    useSetNoteContent,
    useSetNoteDate, useSetContactToCheckin
} from "@/store/CheckinNote.store";
import DateTimePicker, {DateTimePickerEvent} from "@react-native-community/datetimepicker";
import {Button, Text, TextInput, View} from "react-native";
import {Colors, Palette} from "@/constants/design";
import {useCheckIns} from "@/contexts/CheckIns.context";
import {useNotifications} from "@/hooks/useNotificatons";
import {useEffect, useRef, useState} from "react";


type NewNoteHeaderProps = {
    saveNewCheckinWithNote: () => void;
}

const NewNoteHeader = ({saveNewCheckinWithNote}: NewNoteHeaderProps) => {
    const theme = useColorSchemeOrDefault();
    const checkinDate = useCheckinDate();
    const setCheckinDate = useSetNoteDate();
    const {closeModal} = useNewNoteCheckInModalControl();

    const updateCheckinDate = (event: DateTimePickerEvent) => {
        console.log(new Date(event.nativeEvent.timestamp));
        console.log('changed')
        setCheckinDate(new Date(event.nativeEvent.timestamp));
    }

    return (<>
        <Button title="Cancel" color={Colors[theme].buttonBackground} onPress={closeModal}/>
        <View>
            <DateTimePicker
                value={checkinDate}
                onChange={updateCheckinDate}
            />
            <Text>
                with Samy NALBANDIAN
            </Text>
        </View>
        <Button title="Save" color={Colors[theme].buttonBackground} onPress={saveNewCheckinWithNote}/>
    </>);
}

const NewNoteTextInput = () => {
    const noteContent = useNoteContent();
    const setNoteContent = useSetNoteContent();
    const {isModalVisible} = useNewNoteCheckInModalControl();
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);
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
                style={{backgroundColor: Palette.GREY_200, padding: 20, color: 'black', lineHeight: 20}}
                numberOfLines={10}
                multiline
            />
        </View>
    )
}

export const NewNoteModal = () => {
    const modalRef = useModalRef();
    const {openModal, isModalVisible, closeModal} = useNewNoteCheckInModalControl();
    const {postPoneReminder} = useNotifications();
    const {checkInOnContact} = useCheckIns();
    const contact = useContactToCheckin();
    const noteContent = useNoteContent();
    const checkinDate = useCheckinDate();
    const setContactToCheckin = useSetContactToCheckin();

    useEffect(() => {
        if (isModalVisible) {
            modalRef.current?.expand();
        } else {
            modalRef.current?.close();
        }
    }, [isModalVisible]);

    const saveNewCheckinWithNote = () => {
        if (!contact) {
            console.warn('No contact to checkin with');
            return;
        }
        checkInOnContact({
            contact,
            noteContent,
            checkInDate: checkinDate
        });
        postPoneReminder(contact, checkinDate);
        setContactToCheckin(null);
        closeModal();
    };

    const addNote = () => {
        openModal();
    };

    return (
        <MyBottomSheet
            contentToDisplay={<NewNoteTextInput/>}
            header={<NewNoteHeader saveNewCheckinWithNote={saveNewCheckinWithNote}/>}
            ref={modalRef}
        />
    );
}