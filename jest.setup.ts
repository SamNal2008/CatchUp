import "@testing-library/jest-native/extend-expect";
import { NotificationsService } from "./services/notifications/Notification.service";

// Mock expo-constants
jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {
        API_URL: "http://test.api",
      },
    },
  },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  getNotificationSettingsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  addNotificationResponseReceivedListenerAsync: jest.fn(),
}));

// Mock notifications service injection
const mockNotificationsService: jest.Mocked<NotificationsService> = {
  deleteNotificationAndCreateNewPostponed: jest.fn(),
  initializeNotificationsSettings: jest.fn(),
  registerNotificationForContact: jest.fn(),
  requestPermission: jest.fn(),
  registerBirthdayNotificationForContact: jest.fn(),
  clearAllNotifications: jest.fn(),
  deleteNotificationWithId: jest.fn(),
  hasNotificationEnabledOnPhone: jest.fn(),
};

jest.mock("./services/notifications/Notification.service", () => ({
  getNotificationsService: jest.fn(() => mockNotificationsService),
}));

// Mock expo-sqlite
type SQLiteContextType = {
  transaction: (callback: (tx: any) => void) => Promise<void>;
  executeSql: (query: string, params?: any[]) => Promise<any>;
};

jest.mock("expo-sqlite", () => ({
  useSQLiteContext: jest.fn<SQLiteContextType, []>(),
  SQLite: {
    openDatabase: jest.fn(),
  },
  SQLiteWeb: {
    openDatabase: jest.fn(),
  },
}));
