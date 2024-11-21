import {Contact, presentFormAsync} from "expo-contacts";
import {Dispatch, SetStateAction, useState} from "react";
import {
    StyleSheet,
    Image,
    View,
    Text,
    useColorScheme,
    Pressable,
    Modal,
    TouchableOpacity,
    Platform
} from "react-native";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import * as SMS from "expo-sms";
import {Picker} from "@react-native-picker/picker";
import {Colors} from "@/constants/design/Colors";
import * as Linking from 'expo-linking';
import {ReminderFrequency} from "@/repositories/contacts/ReminderFrequency";
import {SymbolView} from 'expo-symbols';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {InitialImage} from "@/components/molecules/InitialImage";
import {logService} from "@/services/log.service";
import { ThemedText } from "../atoms/ThemedText";
import DropDownPicker from 'react-native-dropdown-picker';

type NewFriendSettingsProps = {
    contact: Contact | null;
    frequency: ReminderFrequency;
    setFrequency: Dispatch<SetStateAction<ReminderFrequency>>;
    birthDay: Date | null;
    lastCheckin: Date | null;
    setBirthday: Dispatch<SetStateAction<Date>>;
    setLastCheckin: Dispatch<SetStateAction<Date>>;
};

export const NewFriendSettings = ({contact, frequency, setFrequency, setBirthday, birthDay, setLastCheckin, lastCheckin}: NewFriendSettingsProps) => {
    const theme = useColorScheme() ?? 'light';
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
               {label: 'English', value: 'en'},                  
               {label: 'Deutsch', value: 'de'},
               {label: 'French', value: 'fr'},
                 ]);

    if (!contact) {
        return null;
    }

    const togglePicker = () => {
        setIsPickerVisible(!isPickerVisible);
    };

    const styles = makeStyles(theme);

    const reminderFrequencyOptions: ReminderFrequency[] = [
        "daily",
        "weekly",
        "monthly",
        "yearly",
    ];

    const callContact = async () => {
        const phoneNumber = contact.phoneNumbers?.at(0)?.number;
        if (!phoneNumber) {
            alert("No phone number available");
            return;
        }
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const seeContact = async () => {
        const contactId = contact.id;
        if (!contactId) {
            alert("No phone number available");
            return;
        }
        await presentFormAsync(contactId);
    };

    const sendSms = async () => {
        const phoneNumber = contact.phoneNumbers?.at(0)?.number;
        if (!phoneNumber) {
            alert("No phone number available");
            return;
        }
        try {
            const isAvailable = await SMS.isAvailableAsync();
            if (isAvailable) {
                await SMS.sendSMSAsync(phoneNumber, "Hola from Catchup");
            } else {
                alert("SMS is not available on this device");
            }
        } catch (error) {
            logService.error(error);
            alert("An error occured");
        }
    };

    const openPicker = () => {
        setIsPickerVisible(true);
    };

    const closePicker = () => {
        setIsPickerVisible(false);
    };

    const updateContactBirthday = (event: DateTimePickerEvent) => {
        setBirthday(new Date(event.nativeEvent.timestamp));
    }

    const updateContactLastCheckIn = (event: DateTimePickerEvent) => {
        setLastCheckin(new Date(event.nativeEvent.timestamp));
    }

    const handleFrequencyChange = (items: any) => {
        setFrequency(items[0].value);
    }

    return (
        <View style={styles.container}>
            <View style={styles.contactInfo}>
                <View style={{width: 100, height: 100}}>
                    {contact.image?.uri ? <Image
                        style={styles.image}
                        source={{uri: contact.image?.uri}}
                        /> : <InitialImage firstName={contact.firstName} lastName={contact.lastName}/>}
                </View>
                    <Text style={styles.name}>{contact.firstName} {contact.lastName}</Text>
            </View>
            <View style={styles.actions}>
                {/* Button with icon */}
                <Pressable style={styles.button} onPress={sendSms}>
                    <SymbolView name="message.fill" style={styles.actionIcon} tintColor={Colors[theme].tint}/>
                    <ThemedText type="defaultSemiBold">Message</ThemedText>
                </Pressable>
                <Pressable style={styles.button} onPress={callContact}>
                    <SymbolView name="phone.fill" style={styles.actionIcon} tintColor={Colors[theme].tint}/>
                    <ThemedText type="defaultSemiBold">Call</ThemedText>
                </Pressable>
                <Pressable style={styles.button} onPress={seeContact}>
                    <SymbolView name="person.fill" style={styles.actionIcon} tintColor={Colors[theme].tint}/>
                    <ThemedText type="defaultSemiBold">Contact</ThemedText>
                </Pressable>
            </View>
            <View style={styles.complementaryInfos}>
                <View style={styles.complementaryInfo}>
                    <View style={styles.complementaryInfoTitleContainer}>
                        <Ionicons size={20} color={Colors[theme].icon} name="gift"/>
                        <Text style={styles.complementaryInfoTitle}>Birthday :</Text>
                    </View>
                    <DateTimePicker
                        value={birthDay ? birthDay : new Date()}
                        onChange={updateContactBirthday}/>
                </View>
                <View style={styles.complementaryInfo}>
                    <View style={styles.complementaryInfoTitleContainer}>
                        <AntDesign size={20} color={Colors[theme].icon} name="calendar"/>
                        <Text style={styles.complementaryInfoTitle}>Last check in :</Text>
                    </View>
                    <DateTimePicker value={lastCheckin ?? new Date()} onChange={updateContactLastCheckIn}/>
                </View>
                <View style={styles.complementaryInfo}>
                    <View style={styles.complementaryInfoTitleContainer}>
                        <Ionicons size={20} color={Colors[theme].icon} name="refresh-outline"/>
                        <Text style={styles.complementaryInfoTitle}>Frequency :</Text>
                    </View>
                    <DropDownPicker
                        style={{alignSelf: 'flex-end', flex: 1, backgroundColor: Colors[theme].background}}
                        containerStyle={{height: 40, flex: 1}}
                        textStyle={{color: Colors[theme].text}}
                        dropDownContainerStyle={{backgroundColor: Colors[theme].background}}
                        open={open}
                        value={value}
                        items={reminderFrequencyOptions.map((option) => ({label: option.toUpperCase(), value: option}))}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={handleFrequencyChange}
                        />
                </View>
            </View>
        </View>
    );
};

const makeStyles = (color: 'light' | 'dark') => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 15,
    },
    contactInfo: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    name: {
        fontSize: 20,
        marginBottom: 20,
        color: Colors[color].text,
        fontWeight: 'bold'
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 100,
    },
    actions: {
        flexDirection: "row",
        gap: 30,
        paddingHorizontal: 20
    },
    pickerContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    picker: {
        backgroundColor: "white",
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
    },
    closeButton: {
        marginTop: 10,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#007AFF",
        fontSize: 16,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors[color].background,
        borderRadius: 16,
        flexDirection: "column",
        opacity: 0.7,
        gap: 5,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 0,
    },
    actionIcon: {
        width: 25,
        height: 25,
        margin: 5,
        color: Colors[color].text,
    },
    complementaryInfo: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
    },
    complementaryInfoTitle: {
        fontSize: 20,
        fontWeight: "heavy",
        color: Colors[color].text
    },
    complementaryInfos: {
        paddingTop: 10,
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
        color: Colors[color].text
    },
    complementaryInfoTitleContainer: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        flex: 1
    },
    label: {fontSize: 16, marginVertical: 10},
    frequencyButton: {
        padding: 10,
        backgroundColor: "#eee",
        borderRadius: 5,
        alignItems: "center",
        alignSelf: "flex-start",
    },
    frequencyText: {fontSize: 16},

    // Modal styles for iOS picker
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "white",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        paddingBottom: 20,
    },
    doneButton: {
        alignItems: "flex-end",
        padding: 10,
        backgroundColor: "white",
    },
    doneButtonText: {
        fontSize: 16,
        color: "#007AFF",
    },
    androidPicker: {
        width: "100%",
    },
});
