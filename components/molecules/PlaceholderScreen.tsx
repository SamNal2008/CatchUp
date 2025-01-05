import { ThemedText } from "@/components/atoms/ThemedText";
import React from "react";

export const PlaceholderScreen = () => {
  return (
    <>
      <ThemedText type={"subtitle"}>Keep your closest within reach</ThemedText>
      <ThemedText type={"default"} style={{ textAlign: "center" }}>
        Add friends to stay in touch, share memories, and never miss a birthday
      </ThemedText>
    </>
  );
};
