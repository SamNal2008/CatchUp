import {
  BorderRadius,
  FontWeight,
  LetterSpacing,
  LineHeight,
  Spacing,
  Typography,
} from "@/constants/design";
import { Colors } from "@/constants/design/Colors";
import {
  ColorSchemeName,
  useColorSchemeOrDefault,
} from "@/hooks/useColorScheme";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

export type ButtonProps = {
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
} & Omit<PressableProps, "style">;

const makeStyles = (theme: ColorSchemeName) =>
  StyleSheet.create({
    button: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: Spacing.medium,
      paddingVertical: Spacing.verySmall,
      borderRadius: BorderRadius.round,
      backgroundColor: Colors[theme].buttonBackground,
    },
    backgroundGreyedOut: {
      backgroundColor: Colors[theme].buttonBackgroundDisabled,
    },
    buttonText: {
      fontSize: Typography.medium,
      lineHeight: LineHeight.medium,
      fontWeight: FontWeight.sevenHundred,
      letterSpacing: LetterSpacing.small,
      color: Colors[theme].buttonText,
    },
  });

export const PrimaryButton = ({
  title,
  style,
  textStyle,
  disabled,
  ...rest
}: ButtonProps) => {
  const theme: ColorSchemeName = useColorSchemeOrDefault();
  const styles = makeStyles(theme);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed || disabled ? styles.backgroundGreyedOut : null,
        style,
      ]}
      {...rest}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </Pressable>
  );
};
