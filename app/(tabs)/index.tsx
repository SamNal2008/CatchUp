import {Image, Text, View, StyleSheet} from "react-native";
import {ThemedText} from "@/components/atoms/ThemedText";
import {ThemedView} from "@/components/atoms/ThemedView";
import React, {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from 'expo-router';
import {Palette} from "@/constants/design";
import {CheckInModel} from "@/repositories/check-ins/CheckInEntity";
import {useCheckIns} from "@/contexts/CheckIns.context";
import {InitialImage} from "@/components/molecules/InitialImage";

type CheckInSummaryProps = {
    checkIn: CheckInModel
}

const getWeekDayName = (day: number) => {
    switch (day) {
        case 0:
            return 'Sunday';
        case 1:
            return 'Monday';
        case 2:
            return 'Tuesday';
        case 3:
            return 'Thursday';
        case 4:
            return 'Friday';
        case 5:
            return 'Saturday';
    }
}

const getMonthName = (monthWithYear: string) => {
    const month = monthWithYear.split(' ')[0];
    switch (month) {
        case "0":
            return 'January';
        case "1":
            return 'February';
        case "2":
            return 'March';
        case "3":
            return 'April';
        case "4":
            return 'May';
        case "5":
            return 'June';
        case "6":
            return 'July';
        case "7":
            return 'August';
        case "8":
            return 'September';
        case "9":
            return 'October';
        case "10":
            return 'November';
        case "11":
            return 'December';
    }
}

const DateDayBox = ({date}: { date: Date }) => {
    const weekDay = getWeekDayName(date.getDay())?.toUpperCase().substring(0, 3);
    return (
        <View style={{
            height: 40,
            backgroundColor: Palette.GREY_100,
            alignItems: 'center',
            borderRadius: 6,
            paddingHorizontal: 8,
        }}>
            <Text style={{
                height: 18,
                fontFamily: 'SF Pro',
                fontSize: 13,
                lineHeight: 18,
                color: Palette.GREY_300,
            }}>{weekDay}</Text>
            <Text style={{
                width: 26,
                height: 22,
                fontFamily: 'SF Pro',
                fontWeight: '600',
                fontSize: 17,
                lineHeight: 22,
                textAlign: 'center'
            }}>
                {date.getDate()}
            </Text>
        </View>
    );
}

const CheckInSummary = ({checkIn}: CheckInSummaryProps) => {
    const isNoteContentEmpty = checkIn.noteContent === null || checkIn.noteContent === '';
    return (
        <View style={{backgroundColor: Palette.WHITE, padding: 8, borderRadius: 8, gap: 8, width: '100%'}}>
            <View style={{alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', gap: 30}}>
                <View style={{alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', gap: 10}}>
                    <DateDayBox date={checkIn.checkInDate}/>
                    <ThemedText
                        type={"defaultSemiBold"}>{checkIn.contact.firstName} {checkIn.contact.lastName}</ThemedText>
                </View>
                {checkIn.contact.image ?
                    <Image source={checkIn.contact.image} style={styles.friendImage}/> :
                    <InitialImage firstName={checkIn.contact.firstName} lastName={checkIn.contact.lastName} size={32}/>
                }
            </View>
            {!isNoteContentEmpty ?
                <View style={{backgroundColor: Palette.GREY_100, padding: 8, borderRadius: 8}}>
                    <ThemedText style={{fontFamily: 'SF'}}>{checkIn.noteContent}</ThemedText>
                </View>
                : null}
        </View>);
}

type CheckInByMonth = {
    [key: string]: CheckInModel[]
}

export default function HomeScreen() {
    const {getAllCheckins} = useCheckIns();

    const [checkIns, setCheckIns] = useState<CheckInByMonth>({} as CheckInByMonth);

    const isFirstLaunch = async () => {
        const firstLaunch = await AsyncStorage.getItem("FIRST_LAUNCH");
        await AsyncStorage.setItem("FIRST_LAUNCH", "false");
        return firstLaunch === null;
    }

    const redirectToWelcomeModalIfFirstConnection = async () => {
        const firstLaunch = await isFirstLaunch();
        console.log('First launch :' + firstLaunch);
        if (firstLaunch) {
            router.navigate('/welcome-modal');
            return;
        }
    }

    const retrieveCheckinsFromRepository = () => {
        getAllCheckins().then(checkIns => {
            const checkInsByMonth = checkIns.reduce((acc, checkIn) => {
                const month = `${checkIn.checkInDate.getMonth()} ${checkIn.checkInDate.getFullYear()}`;
                if (!acc[month]) {
                    acc[month] = [];
                }
                acc[month].push(checkIn);
                return acc;
            }, {} as CheckInByMonth);
            setCheckIns(checkInsByMonth);
        });
    }

    const hasCheckIns = Object.keys(checkIns).length > 0;

    useEffect(() => {
        redirectToWelcomeModalIfFirstConnection();
        retrieveCheckinsFromRepository();
    }, []);

    return (
        <ThemedView>
            <View style={[styles.container, hasCheckIns ? styles.containerWithCheckin : null]}>
                {!hasCheckIns ?
                    <>
                        <ThemedText type={"subtitle"}>
                            Keep your closest within reach
                        </ThemedText>
                        <ThemedText type={"default"} style={{textAlign: "center"}}>
                            Add friends to stay in touch, share memories, and never miss a
                            birthday
                        </ThemedText>
                    </> :
                    Object.keys(checkIns)
                        .map((checkInMonthWithYear: string) =>
                            <View key={checkInMonthWithYear} style={{width: '100%', gap: 10}}>
                                <ThemedText type={'sectionTitle'}>{`${getMonthName(checkInMonthWithYear)} ${checkInMonthWithYear.split(' ')[1]}`}</ThemedText>
                                {checkIns[checkInMonthWithYear]
                                    .map((checkIn: CheckInModel) =>
                                        <CheckInSummary key={`${checkIn.contact.id} ${checkIn.checkInDate}`} checkIn={checkIn}/>
                                    )}
                            </View>
                        )
                }
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 20,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
        width: '100%'
    },
    friendImage: {
        width: 32,
        height: 32,
        borderRadius: 100,
    },
    containerWithCheckin: {
        justifyContent: 'flex-start'
    }
});
