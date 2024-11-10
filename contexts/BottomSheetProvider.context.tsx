import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView
} from "@gorhom/bottom-sheet";
import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {Button, StyleSheet, View} from "react-native";
import {useThemeColor} from "@/hooks/useThemeColor";
import {Colors} from "@/constants/design";
import {useColorSchemeOrDefault} from "@/hooks/useColorScheme";

type BottomSheetContextProps = {
    showBottomSheet: (header: ReactNode, content: ReactNode) => void;
    closeSheet: () => void;
};

const BottomSheetContext = createContext<BottomSheetContextProps | null>(null);

export const useMyBottomSheet = () => {
    const context = useContext(BottomSheetContext);
    if (!context) throw new Error('Context should be defined');
    return context;
}

export const MyBottomSheetProvider = ({children}: { children: ReactNode }) => {
    console.log('rendering bottom sheet provider');
    const [contentToDisplay, setContentToDisplay] = useState<ReactNode | null>(null);
    const [header, setHeader] = useState<ReactNode | null>(null);
    const snapPoints = useMemo(() => ["50%", "60%", "80%"], []);
    const bottomSheetRef = useRef<BottomSheet>(null);


    const closeSheet = () => {
        bottomSheetRef.current?.close();
    };


    const showBottomSheet = (header: ReactNode, content: ReactNode) => {
        setHeader(header);
        setContentToDisplay(content);
        bottomSheetRef.current?.expand();
    };

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                style={[props.style]}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                pressBehavior="close"
            />
        ),
        []
    );

    const iconColor = useThemeColor("icon");
    const backgroundColor = useThemeColor("background");
    const theme = useColorSchemeOrDefault();

    return (
        <BottomSheetContext.Provider value={{showBottomSheet, closeSheet}}>
            {children}
            <BottomSheet
                ref={bottomSheetRef}
                backdropComponent={renderBackdrop}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                style={[
                    {
                        backgroundColor,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    },
                ]}
                handleIndicatorStyle={{backgroundColor: iconColor}}
                backgroundStyle={{backgroundColor}}
                index={-1}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.bottomSheetHeader}>
                        {header}
                    </View>
                    {contentToDisplay}
                </BottomSheetView>
            </BottomSheet>
        </BottomSheetContext.Provider>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    bottomSheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 10
    },
    contentContainer: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
});