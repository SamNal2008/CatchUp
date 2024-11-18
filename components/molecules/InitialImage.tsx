import {Text, View, StyleSheet} from "react-native";
import {Palette} from "@/constants/design";

interface InitialImageProps {
    firstName?: string,
    lastName?: string,
    size?: number
}

export const InitialImage = ({firstName, lastName, size}: InitialImageProps) => {
    const firstNameInitial = firstName?.charAt(0)?.toUpperCase();
    const lastNameInitial = lastName?.charAt(0)?.toUpperCase();
    const initial = `${firstNameInitial}${lastNameInitial}`;
    return (<View style={[styles.image, {width: size, height: size}]}>
        <Text style={[styles.initial, {fontSize: 16}]}>
            {initial}
        </Text>
    </View>);
}

const styles = StyleSheet.create({
    initial: {
        width: 45,
        height: 41,
        fontFamily: 'SF Pro',
        fontWeight: 400,
        fontSize: 34,
        lineHeight: 41,
        textAlign: 'center',
        letterSpacing: 0.25,
        color: Palette.WHITE,
        flexGrow: 0
    },
    image: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Palette.GREY_300,
        width: 32,
        height: 32,
        borderRadius: 36,
        gap: 10
    }
});

