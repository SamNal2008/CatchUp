import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ContactProvider } from "@/contexts/Contact.context";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { DATABASE_NAME } from "../repositories/contacts/Contacts.repository";
import { CheckInsProvider } from "@/contexts/CheckIns.context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
        <ContactProvider>
          <CheckInsProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="contacts-modal"
                options={{
                  headerShown: false,
                  presentation: "formSheet",
                  headerTitle: "test",
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </CheckInsProvider>
        </ContactProvider>
      </SQLiteProvider>
    </ThemeProvider>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 2;
  const dbInfo = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  console.debug(dbInfo);
  if (dbInfo == null) {
    throw new Error("Failed to get database version");
  }
  let { user_version: currentDbVersion } = dbInfo;
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  console.debug(`Migrating database from version ${currentDbVersion} to ${DATABASE_VERSION}`);
  if (currentDbVersion === 0) {
    console.log('creating contacts table');
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
     CREATE TABLE if not exists contacts (contact_id TEXT PRIMARY KEY, frequency TEXT NOT NULL);
      `);
    currentDbVersion = 1;
  }
  if (currentDbVersion === 1) {
    console.log('creating check_ins table');
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
     CREATE TABLE if not exists check_ins (contact_id TEXT, check_in_date TIMESTAMP NOT NULL, PRIMARY KEY (contact_id, check_in_date));
      `);
    currentDbVersion = 2;
  }
  // if (currentDbVersion === 2) {
  //   add more migration
  // }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
