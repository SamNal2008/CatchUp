import {Text, View, StyleSheet} from "react-native";
import {Palette} from "@/constants/design";
import { ThemedText } from "../atoms/ThemedText";

interface InitialImageProps {
    firstName?: string;
    lastName?: string;
    size?: number;
}

export const InitialImage = ({firstName, lastName, size = 45}: InitialImageProps) => {
    const firstNameInitial = firstName?.charAt(0)?.toUpperCase();
    const lastNameInitial = lastName?.charAt(0)?.toUpperCase();
    const initial = `${firstNameInitial}${lastNameInitial}`;
    const styles = makeStyles(size);

    return (
        <View style={[styles.container]}>
            <ThemedText style={[styles.initial]}>
                {initial}
            </ThemedText>
        </View>
    );
}

const makeStyles = (size: number) => StyleSheet.create({
    container: {
        width: size,
        height: size,
        borderRadius: size,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Palette.GREY_300,
    },
    initial: {
        textAlign: 'center',
        color: Palette.WHITE,
        includeFontPadding: false,
        textAlignVertical: 'center',
        fontSize: size * 0.43,
        lineHeight: size
    }
});
