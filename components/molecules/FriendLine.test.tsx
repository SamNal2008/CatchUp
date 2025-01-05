import { useCheckIns } from "@/contexts/CheckIns.context";
import { useContacts } from "@/contexts/Contact.context";
import { ContactModel } from "@/repositories";
import { render, screen, userEvent } from "@testing-library/react-native";
import { FriendLine } from "./FriendLine";

// Mock the hooks
jest.mock("@/contexts/CheckIns.context");
jest.mock("@/contexts/Contact.context");

describe("FriendLine", () => {
  const mockContact: ContactModel = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    frequency: "daily",
    birthDate: new Date("1990-01-01"),
    lastCheckin: new Date("2022-01-01"),
    contactType: "person",
    name: "John Doe",
  };

  const mockGetLatestCheckIn = jest.fn();
  const mockDeleteFriend = jest.fn().mockImplementation(async (_: string) => {
    return Promise.resolve();
  });

  beforeEach(() => {
    // Setup mock implementations
    (useCheckIns as jest.Mock).mockReturnValue({
      getLatestCheckInForContact: mockGetLatestCheckIn,
    });
    (useContacts as jest.Mock).mockReturnValue({
      deleteFriend: mockDeleteFriend,
      friends: [mockContact],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders only contact initials correctly", () => {
    render(<FriendLine contact={mockContact} />);
    expect(screen.getByText("JD")).toBeTruthy();
  });

  it("calls deleteFriend when confirmed", async () => {
    // given
    const user = userEvent.setup();
    jest.mock("@/contexts/Contact.context", () => ({
      useContacts: jest.fn().mockReturnValue({
        deleteFriend: mockDeleteFriend,
        friends: [mockContact],
      }),
    }));
    render(<FriendLine contact={mockContact} />);
    const deleteButton = screen.getByTestId("delete-friend-button");

    // when
    await user.press(deleteButton);

    // then
    expect(mockDeleteFriend).toHaveBeenCalledWith(mockContact.id);
  });

  it("loads and displays the duration between today and the last check-in", () => {
    // given
    const mockToday = new Date("2025-01-06");
    const mockLastCheckIn = new Date("2025-01-01");
    jest.useFakeTimers().setSystemTime(mockToday);
    mockGetLatestCheckIn.mockReturnValue(mockLastCheckIn);
    // when
    render(<FriendLine contact={mockContact} />);
    // then
    expect(screen.getByText("Checked in 5 days ago")).toBeTruthy();
    jest.useRealTimers();
  });
});
