import {Image, View, StyleSheet, FlatList} from "react-native";
import {ThemedText} from "@/components/atoms/ThemedText";
import {ThemedView} from "@/components/atoms/ThemedView";
import React, {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from 'expo-router';
import {Colors, Size, Spacing} from "@/constants/design";
import {CheckInModel} from "@/repositories/check-ins/CheckInEntity";
import {useCheckIns} from "@/contexts/CheckIns.context";
import {InitialImage} from "@/components/molecules/InitialImage";
import {useColorSchemeOrDefault} from "@/hooks/useColorScheme";
import {logService} from "@/services/log.service";

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
            return 'Wednesday';
        case 4:
            return 'Thursday';
        case 5:
            return 'Friday';
        case 6:
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
    const theme = useColorSchemeOrDefault();
    return (
        <View style={{
            height: 40,
            backgroundColor: Colors[theme].background,
            alignItems: 'center',
            borderRadius: 6,
            paddingHorizontal: 8,
        }}>
            <ThemedText style={{
                height: 18,
                fontFamily: 'SF Pro',
                fontSize: 13,
                lineHeight: 18,
            }}>
                {weekDay}
            </ThemedText>
            <ThemedText style={{
                width: 26,
                height: 22,
                fontFamily: 'SF Pro',
                fontWeight: '600',
                fontSize: 17,
                lineHeight: 22,
                textAlign: 'center'
            }}>
                {date.getDate()}
            </ThemedText>
        </View>
    );
}

type CheckInMonthYearProps = {
    checkInMonthWithYear: string
    checkIns: CheckInByMonth
}

const CheckInMonthYear = ({checkInMonthWithYear, checkIns}: CheckInMonthYearProps) => {
    const month = getMonthName(checkInMonthWithYear);
    const year = checkInMonthWithYear.split(' ')[1];

    return (
        <View key={checkInMonthWithYear} style={{width: Size.full, gap: Spacing.small}}>
            <ThemedText type={'sectionTitle'}>
                {`${month} ${year}`}
            </ThemedText>
            <FlatList
                contentContainerStyle={{width: Size.full, gap: Spacing.medium}}
                style={{width: Size.full, gap: Spacing.medium}}
                data={checkIns[checkInMonthWithYear]}
                renderItem={({item}) => <CheckInSummary checkIn={item}/>}
                keyExtractor={(item) => `${item.contact.id} ${item.checkInDate}`}
            />
        </View>
    );
}

const CheckInSummary = ({checkIn}: CheckInSummaryProps) => {
    const isNoteContentEmpty = checkIn.noteContent === null || checkIn.noteContent === '';
    const theme = useColorSchemeOrDefault();
    return (
        <View style={{
            backgroundColor: Colors[theme].toastBackground,
            padding: 8,
            borderRadius: 8,
            gap: 8,
            width: '100%'
        }}>
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
                <View style={{backgroundColor: Colors[theme].background, padding: 8, borderRadius: 8}}>
                    <ThemedText style={{fontFamily: 'SF'}}>{checkIn.noteContent}</ThemedText>
                </View>
                : null}
        </View>);
}

type CheckInByMonth = {
    [key: string]: CheckInModel[]
}

export default function HomeScreen() {
    const {checkIns} = useCheckIns();
    const [checkInsByMonth, setCheckInsByMonth] = useState<CheckInByMonth>({});

    const isFirstLaunch = async () => {
        const firstLaunch = await AsyncStorage.getItem("FIRST_LAUNCH");
        await AsyncStorage.setItem("FIRST_LAUNCH", "false");
        return firstLaunch === null;
    }

    const redirectToWelcomeModalIfFirstConnection = async () => {
        const firstLaunch = await isFirstLaunch();
        logService.log('First launch :' + firstLaunch);
        if (firstLaunch) {
            router.navigate('/welcome-modal');
            return;
        }
    }

    const retrieveCheckinsFromRepository = (checkIns: CheckInModel[]) => {
        const checkInsByMonth = checkIns
            .sort((a, b) => a.checkInDate.getTime() - b.checkInDate.getTime())
            .reduce((acc, checkIn) => {
                const month = `${checkIn.checkInDate.getMonth()} ${checkIn.checkInDate.getFullYear()}`;
                if (!acc[month]) {
                    acc[month] = [];
                }
                acc[month].push(checkIn);
                return acc;
            }, {} as CheckInByMonth);
        setCheckInsByMonth(checkInsByMonth);
    }

    useEffect(() => {
        retrieveCheckinsFromRepository(checkIns);
    }, [checkIns]);

    const hasCheckIns = Object.keys(checkIns).length > 0;

    useEffect(() => {
        redirectToWelcomeModalIfFirstConnection().catch(logService.error);
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
                    <FlatList
                        contentContainerStyle={{gap: Spacing.medium, width: Size.full}}
                        style={{width: '100%'}}
                        data={Object.keys(checkInsByMonth)}
                        renderItem={({item}) =>
                            <CheckInMonthYear
                                checkIns={checkInsByMonth}
                                checkInMonthWithYear={item}
                            />
                        }
                    />
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
