import {StyleSheet, Text, TextInput, View} from "react-native";
import { ThemedText } from "@/components/atoms/ThemedText";
import { ThemedView } from "@/components/atoms/ThemedView";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';
import {Palette} from "@/constants/design";
import {useModalRef} from "@/components/navigation/BottomSheet";
import {CheckInModel} from "@/repositories/check-ins/CheckInEntity";
import {create} from "zustand/index";

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

const DateDayBox = ({date}: {date: Date}) => {
  const weekDay = getWeekDayName(date.getDay())?.toUpperCase().substring(0, 3);
  return (
      <View style={{width: 42, height: 40, backgroundColor: Palette.GREY_100, alignItems: 'center', borderRadius: 6, paddingHorizontal: 8, flexGrow: 0}}>
        <Text style={{width: 26, height: 18, fontFamily: 'SF Pro', fontSize: 13, lineHeight: 18, color: Palette.GREY_300}}>{weekDay}</Text>
        <Text style={{width: 26, height: 22, fontFamily: 'SF Pro', fontWeight: '600', fontSize: 17, lineHeight: 22, textAlign: 'center'}}>
          {date.getDate()}
        </Text>
      </View>
  );
}

const CheckInSummary = ({checkIn}: CheckInSummaryProps) => {
  return (<View style={{backgroundColor: Palette.WHITE, padding: 8, borderRadius: 8, gap: 8}}>
    <View style={{alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
      <View style={{alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', gap: 10}}>
        <DateDayBox date={new Date()} />
        <ThemedText type={"subtitle"}>{checkIn.contact.firstName} {checkIn.contact.lastName}</ThemedText>
      </View>
      <View  style={{backgroundColor: 'black', width: 30, height: 30}}/>
    </View>
    <View style={{backgroundColor: Palette.GREY_100, padding: 8, borderRadius: 8}}>
      <ThemedText style={{fontFamily: 'SF'}}>{checkIn.noteContent}</ThemedText>
    </View>
  </View>);
}

export default function HomeScreen() {
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

  useEffect(() => {
    redirectToWelcomeModalIfFirstConnection();
  }, []);

  return (
    <ThemedView>
      <View style={[styles.container]}>
        <ThemedText type={"subtitle"}>
          Keep your closest within reach
        </ThemedText>
        <ThemedText type={"default"} style={{ textAlign: "center" }}>
          Add friends to stay in touch, share memories, and never miss a
          birthday
        </ThemedText>
        <CheckInSummary checkIn={{
          checkInDate: new Date(), contact: {
            frequency: 'daily',
            lastCheckin: new Date(),
            birthDate: {} as Date,
            contactType: 'company',
            firstName: 'Samy',
            lastName: 'Nalbandian',
            name: 'John Doe',
          }, noteContent: 'Bière @Biertgit à la cool avec le Samy. On a débrief de notre dernière soirée au Mazette et de nos déguisements pour ...'
        } as unknown as CheckInModel}/>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  }
});
