import {ButtonProps, PrimaryButton} from "@/components/atoms/PrimaryButton";
import {Colors, Palette} from "@/constants/design";
import React from "react";
import {ColorSchemeName, useColorSchemeOrDefault} from "@/hooks/useColorScheme";
import {StyleSheet} from "react-native";

const makeStyles = (theme: ColorSchemeName) => StyleSheet.create({
    button: {
        backgroundColor: 'transparent',
        borderColor: Colors[theme].text,
        borderWidth: 1,
        borderStyle: 'solid'
    },
    text: {
        color: Colors[theme].text
    }
});

export const SecondaryButton = (props: ButtonProps) => {
    const theme = useColorSchemeOrDefault();
    const styles = makeStyles(theme);
    return (<PrimaryButton
        {...props}
        style={styles.button}
        textStyle={styles.text}
    />);
}