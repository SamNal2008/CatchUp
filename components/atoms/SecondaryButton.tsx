import {ButtonProps, PrimaryButton} from "@/components/atoms/PrimaryButton";
import {Palette} from "@/constants/design";
import React from "react";
import {useColorSchemeOrDefault} from "@/hooks/useColorScheme";
import {StyleSheet} from "react-native";

const makeStyles = (theme: string) => StyleSheet.create({
    button: {
        backgroundColor: 'transparent',
        borderColor: Palette.GREY_300,
        borderWidth: 1,
        borderStyle: 'solid'
    },
    text: {
        color: Palette.GREY_300
    }
});

export const SecondaryButton = ({onPress, title}: ButtonProps) => {
    const theme = useColorSchemeOrDefault();
    const styles = makeStyles(theme);
    return (<PrimaryButton
        title={title}
        onPress={onPress}
        style={styles.button}
        textStyle={styles.text}
    />);
}