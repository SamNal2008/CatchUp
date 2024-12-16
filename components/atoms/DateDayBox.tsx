import {useColorSchemeOrDefault} from "@/hooks/useColorScheme";
import {View} from "react-native";
import {Colors} from "@/constants/design";
import {ThemedText} from "@/components/atoms/ThemedText";
import React from "react";


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

export const DateDayBox = ({date}: { date: Date }) => {
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
