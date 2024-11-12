import {Button, StyleSheet, Text, TextInput, View} from "react-native";
import {useColorSchemeOrDefault, ColorSchemeName} from "@/hooks/useColorScheme";
import Toast from "react-native-root-toast";
import {Colors, Palette} from "@/constants/design";
import {ThemedText} from "@/components/atoms/ThemedText";
import {PrimaryButton} from "@/components/atoms/PrimaryButton";
import {SecondaryButton} from "@/components/atoms/SecondaryButton";
import {ContactModel} from "@/repositories";
import {useMyBottomSheet} from "@/contexts/BottomSheetProvider.context";
import DateTimePicker, {DateTimePickerEvent} from "@react-native-community/datetimepicker";
import {create} from 'zustand'
import {useEffect, useState} from "react";

type Note = {
    content: string,
    date: Date
}

type NoteStore = {
    note: Note,
    setNoteContent: (content: string) => void;
    setCheckinDate: (date: Date) => void;
};

const useNoteStore = create<NoteStore>((set) => ({
    note: {
        content: '',
        date: new Date()
    },
    setNoteContent: (content: string) => set((state: NoteStore) => ({note: {...state.note, content}})),
    setCheckinDate: (date: Date) => set((state: NoteStore) => ({note: {...state.note, date: date}})),
}))

export type CheckInToastProps = {
    checkedInContact: ContactModel,
    hideToast: () => void
}

type NewNoteHeaderProps = {
    checkinDate: Date,
    setCheckinDate: (date: Date) => void;
    saveNewNote: () => void;
}

const NewNoteHeader = ({saveNewNote, setCheckinDate, checkinDate}: NewNoteHeaderProps) => {
    const theme = useColorSchemeOrDefault();
    const {closeSheet} = useMyBottomSheet();

    const updateCheckinDate = (event: DateTimePickerEvent) => {
        console.log(new Date(event.nativeEvent.timestamp));
        console.log('changed')
        setCheckinDate(new Date(event.nativeEvent.timestamp));
    }
    return (<>
        <Button title="Cancel" color={Colors[theme].buttonBackground} onPress={closeSheet}/>
        <View>
            <DateTimePicker
                value={checkinDate}
                onChange={updateCheckinDate}
            />
            <Text>
                with Samy NALBANDIAN
            </Text>
        </View>
        <Button title="Save" color={Colors[theme].buttonBackground} onPress={saveNewNote}/>
    </>);
}


type NewNoteTextInput = {
    setNoteContent: (newNoteContent: string) => void;
    noteContent: string;
}

const NewNoteTextInput = ({setNoteContent, noteContent}: NewNoteTextInput) => {
    const [content, setContent] = useState('');
    useEffect(() => {
        setNoteContent(content);
    }, [content]);
    return (
        <View style={{flex: 1, padding: 10}}>
            <TextInput
                value={content}
                onChangeText={setContent}
                style={{backgroundColor: Palette.GREY_200, padding: 20, color: 'black'}}
                numberOfLines={10}
                multiline
            />
        </View>
    )
}

export const CheckInToast = ({checkedInContact, hideToast}: CheckInToastProps) => {
    const theme: ColorSchemeName = useColorSchemeOrDefault();
    const {showBottomSheet, closeSheet} = useMyBottomSheet();
    const styles = makeStyles(theme);
    const {note, setNoteContent, setCheckinDate} = useNoteStore();

    const saveNewNote = () => {
        console.log(`Saving new note for date ${note.date} and with content : ${note.content}`);
        closeSheet();
        /*checkInsRepository.checkInOnContact(contact.id);
        postPoneReminder(contact);*/
    };


    const addNote = () => {
        hideToast();
        showBottomSheet(
            <NewNoteHeader
                checkinDate={note.date}
                setCheckinDate={setCheckinDate}
                saveNewNote={saveNewNote}
            />,
            <NewNoteTextInput
                noteContent={note.content}
                setNoteContent={setNoteContent}
            />
        )
    };

    return (
        <>
            <Toast
                visible={true}
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
                        <SecondaryButton title={"Undo"} onPress={hideToast}/>
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
        justifyContent: 'center'
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
});