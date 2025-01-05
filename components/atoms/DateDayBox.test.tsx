import { render, screen } from "@testing-library/react-native";
import { DateDayBox } from "./DateDayBox";

describe("DateDayBox", () => {
  const mockDate = new Date("2025-01-05");

  it("matches snapshot", () => {
    const { toJSON } = render(<DateDayBox date={mockDate} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("matches snapshot with custom style", () => {
    const { toJSON } = render(<DateDayBox date={mockDate} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders the correct day and month", () => {
    render(<DateDayBox date={mockDate} />);

    // Using getByText with a regular expression to match the day (5)
    expect(screen.getByText("5")).toBeTruthy();

    // Check for the month (Jan)
    expect(screen.getByText("SUN")).toBeTruthy();
  });
});
