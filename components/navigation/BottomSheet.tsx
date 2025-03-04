import { useThemeColor } from "@/hooks/useThemeColor";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  ReactNode,
  RefObject,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, View } from "react-native";

export type ModalProps = {
  contentToDisplay: ReactNode;
  header: ReactNode;
  snapPoints?: (string | number)[];
};

export const useModalRef = (): RefObject<BottomSheetModal> => {
  return useRef<BottomSheetModal>(null);
};

export const MyBottomSheet = forwardRef<BottomSheetModal, ModalProps>(
  (
    { header, contentToDisplay, snapPoints: customSnapPoints }: ModalProps,
    ref,
  ) => {
    // Use custom snap points if provided, otherwise use default snap points
    const snapPoints = useMemo(
      () => customSnapPoints || ["50%", "65%"],
      [customSnapPoints],
    );
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
      [],
    );

    const iconColor = useThemeColor("icon");
    const backgroundColor = useThemeColor("toastBackground");

    return (
      <BottomSheet
        ref={ref}
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
        handleIndicatorStyle={{
          backgroundColor: iconColor,
        }}
        handleStyle={{
          paddingVertical: 8,
        }}
        backgroundStyle={{ backgroundColor }}
        index={-1}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.bottomSheetHeader}>{header}</View>
          {contentToDisplay}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

// For debugging and logging
MyBottomSheet.displayName = "MyBottomSheet";

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
    paddingHorizontal: 8,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
