import { useNotifications } from "@/hooks/useNotificatons";
import { ContactModel, getContactsRepository } from "@/repositories";
import {
  CheckInEntity,
  CheckInModel,
} from "@/repositories/check-ins/CheckInEntity";
import { getCheckInsRepository } from "@/repositories/check-ins/CheckIns.repository";
import { useNewCheckinStore } from "@/store/CheckinNote.store";
import { useCheckinsStore } from "@/store/Checkins.store";
import { act, renderHook } from "@testing-library/react-native";
import { useSQLiteContext } from "expo-sqlite";
import { CheckInsProvider, useCheckIns } from "./CheckIns.context";

// Mock dependencies
jest.mock("expo-sqlite");
jest.mock("@/repositories/check-ins/CheckIns.repository");
jest.mock("@/repositories");
jest.mock("@/hooks/useNotificatons");
jest.mock("@/store/CheckinNote.store");
jest.mock("@/store/Checkins.store");

describe("CheckIns Context", () => {
  describe("Legacy", () => {
    const mockDb = {};
    const mockContact: ContactModel = {
      id: "123",
      name: "John Doe",
      birthDate: new Date("1990-01-01"),
      frequency: "daily",
      contactType: "person",
      lastCheckin: new Date("2025-01-13"),
    };

    const mockCheckIn: CheckInModel = {
      contact: mockContact,
      noteContent: "Test note",
      checkInDate: new Date("2025-01-13"),
    };

    const mockCheckInEntity: CheckInEntity = {
      contact_id: "123",
      note_content: "Test note",
      check_in_date: new Date("2025-01-13"),
    };

    const mockCheckInsRepository = {
      getAllCheckIns: jest.fn(),
      checkInOnContact: jest.fn(),
      deleteAllCheckInWithContactId: jest.fn(),
      getLatestCheckInForContact: jest.fn(() => mockCheckInEntity),
    };
    const mockContactsRepository = {
      getById: jest.fn(),
    };
    const mockPostponeReminder = jest.fn();
    const mockSetCheckIns = jest.fn();
    const mockResetNewFriendCheckIn = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();

      (useSQLiteContext as jest.Mock).mockReturnValue(mockDb);
      (getCheckInsRepository as jest.Mock).mockReturnValue(
        mockCheckInsRepository,
      );
      (getContactsRepository as jest.Mock).mockReturnValue(
        mockContactsRepository,
      );
      (useNotifications as jest.Mock).mockReturnValue({
        postPoneReminder: mockPostponeReminder,
      });
      (useNewCheckinStore as jest.Mock).mockReturnValue({
        resetNewFriendCheckIn: mockResetNewFriendCheckIn,
        checkInDate: new Date("2025-01-13"),
        noteContent: "Test note",
        contactToCheckin: mockContact,
      });
      (useCheckinsStore as jest.Mock).mockReturnValue({
        setCheckIns: mockSetCheckIns,
        checkIns: [mockCheckIn],
      });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CheckInsProvider>{children}</CheckInsProvider>
    );

    it("should get all check-ins successfully", async () => {
      mockCheckInsRepository.getAllCheckIns.mockReturnValue([
        {
          contact_id: "123",
          note_content: "Test note",
          check_in_date: "2025-01-13",
        },
      ]);
      mockContactsRepository.getById.mockResolvedValue(mockContact);

      const { result } = renderHook(() => useCheckIns(), { wrapper });

      const checkIns = await result.current.getAllCheckins();

      expect(checkIns).toHaveLength(1);
      expect(checkIns[0]).toEqual(mockCheckIn);
      expect(mockCheckInsRepository.getAllCheckIns).toHaveBeenCalled();
      expect(mockContactsRepository.getById).toHaveBeenCalledWith("123");
    });

    it("should check in on contact successfully", async () => {
      const { result } = renderHook(() => useCheckIns(), { wrapper });

      // when
      result.current.checkInOnContact();

      expect(mockCheckInsRepository.checkInOnContact).toHaveBeenCalledWith({
        contact_id: "123",
        check_in_date: new Date("2025-01-13"),
        note_content: "Test note",
      });
      expect(mockPostponeReminder).toHaveBeenCalledWith(
        mockContact,
        new Date("2025-01-13"),
      );
      expect(mockResetNewFriendCheckIn).toHaveBeenCalled();
    });

    it("should delete check-in for friend", async () => {
      const { result } = renderHook(() => useCheckIns(), { wrapper });

      await act(async () => {
        result.current.deleteCheckinForFriend("123");
      });

      expect(
        mockCheckInsRepository.deleteAllCheckInWithContactId,
      ).toHaveBeenCalledWith("123");
    });

    it("should get latest check-in date for contact", () => {
      const { result } = renderHook(() => useCheckIns(), { wrapper });

      const latestDate = result.current.getLatestCheckInForContact("123");

      expect(latestDate).toEqual(new Date("2025-01-13"));
    });

    it("should handle check-in failure when contact is not defined", async () => {
      (useNewCheckinStore as jest.Mock).mockReturnValue({
        ...useNewCheckinStore(),
        contactToCheckin: null,
      });

      const { result } = renderHook(() => useCheckIns(), { wrapper });

      await act(async () => {
        result.current.checkInOnContact();
      });

      expect(mockCheckInsRepository.checkInOnContact).not.toHaveBeenCalled();
      expect(mockPostponeReminder).not.toHaveBeenCalled();
    });
  });
});
