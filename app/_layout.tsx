import { AdminModal } from "@/components/molecules/AdminDataSelection";
import { NewNoteModal } from "@/components/organisms/NewNoteModal";
import { CheckInsProvider } from "@/contexts/CheckIns.context";
import { ContactProvider } from "@/contexts/Contact.context";
import { NewFriendContextProvider } from "@/contexts/NewFriendProvider.context";
import { useColorSchemeOrDefault } from "@/hooks/useColorScheme";
import { DATABASE_NAME } from "@/repositories";
import { logService } from "@/services/log.service";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { RootSiblingParent } from "react-native-root-siblings";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorSchemeOrDefault();
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <StatusBar style="auto" />
                <BottomSheetModalProvider>
                    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
                        <RootSiblingParent>
                            <CheckInsProvider>
                                <ContactProvider>
                                        <NewFriendContextProvider>
                                            <Stack>
                                                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                                                <Stack.Screen
                                                    name="welcome-modal"
                                                    options={{
                                                        headerShown: false,
                                                        presentation: "modal",
                                                    }}
                                                />
                                                <Stack.Screen name="+not-found"/>
                                            </Stack>
                                            <NewNoteModal />
                                            <AdminModal />
                                        </NewFriendContextProvider>
                                </ContactProvider>
                            </CheckInsProvider>
                        </RootSiblingParent>
                    </SQLiteProvider>
                </BottomSheetModalProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 4;
    const dbInfo = await db.getFirstAsync<{ user_version: number }>(
        "PRAGMA user_version"
    );
    if (dbInfo == null) {
        throw new Error("Failed to get database version");
    }
    let {user_version: currentDbVersion} = dbInfo;
    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }
    logService.debug(`Migrating database from version ${currentDbVersion} to ${DATABASE_VERSION}`);
    if (currentDbVersion === 0) {
        logService.log('creating contacts table');
        await db.execAsync(`
      PRAGMA journal_mode = 'wal';
     CREATE TABLE if not exists contacts (contact_id TEXT PRIMARY KEY, frequency TEXT NOT NULL);
      `);
        currentDbVersion = 1;
    }
    if (currentDbVersion === 1) {
        logService.log('creating check_ins table');
        await db.execAsync(`
      PRAGMA journal_mode = 'wal';
     CREATE TABLE if not exists check_ins (contact_id TEXT, check_in_date TIMESTAMP NOT NULL, PRIMARY KEY (contact_id, check_in_date));
      `);
        currentDbVersion = 2;
    }

    if (currentDbVersion === 2) {
        logService.log('creating notifications table');
        await db.execAsync(`
      PRAGMA journal_mode = 'wal';
     CREATE TABLE if not exists notifications (contact_id TEXT, notification_id TEXT, frequency TEXT , PRIMARY KEY (contact_id, notification_id));
      `);
        currentDbVersion = 3;
    }

    if (currentDbVersion === 3) {
        logService.log('Adding note in checkin table');
        await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      ALTER TABLE check_ins ADD COLUMN note_content TEXT DEFAULT NULL;
      `);
        currentDbVersion = 4;
    }

    // if (currentDbVersion === 4) {
    //   add more migration
    // }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
