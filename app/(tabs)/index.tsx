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
import {PlaceholderScreen} from "@/components/molecules/PlaceholderScreen";
import {DateDayBox} from "@/components/atoms/DateDayBox";
import {DateUtils} from "@/constants/DateUtils";

type CheckInSummaryProps = {
    checkIn: CheckInModel
}

type CheckInMonthYearProps = {
    checkInMonthWithYear: string
    checkIns: CheckInByMonth
}

const CheckInMonthYear = ({checkInMonthWithYear, checkIns}: CheckInMonthYearProps) => {
    const month = DateUtils.getMonthName(checkInMonthWithYear);
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
                keyExtractor={(item) => `${item?.contact?.id} ${item?.checkInDate}`}
            />
        </View>
    );
}

const CheckInSummary = ({checkIn}: CheckInSummaryProps) => {
    const isNoteContentEmpty = checkIn?.noteContent === null || checkIn?.noteContent === '';
    const theme = useColorSchemeOrDefault();
    if (!checkIn || !checkIn.contact) {
        return null;
    }
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
                    <ThemedText type={"defaultSemiBold"}>{checkIn.contact?.firstName} {checkIn.contact?.lastName}</ThemedText>
                </View>
                {checkIn.contact?.image ?
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
        const checkInsByMonth = checkIns.reduce((acc, checkIn) => {
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
        <ThemedView style={[styles.container, hasCheckIns ? styles.containerWithCheckin : null]}>
            {!hasCheckIns ? <PlaceholderScreen /> :
                <FlatList
                    contentContainerStyle={{gap: Spacing.medium, width: Size.full, paddingBottom: Spacing.medium}}
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
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 20,
        paddingHorizontal: 16,
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
