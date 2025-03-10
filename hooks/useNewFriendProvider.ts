import { NewFriendContext } from "@/contexts/NewFriendProvider.context";
import { useContext } from "react";

export const useNewFriendProvider = () => {
  const context = useContext(NewFriendContext);

  if (!context) {
    throw new Error(
      "useNewFriendProvider must be used within a NewFriendContextProvider",
    );
  }

  return context;
};
