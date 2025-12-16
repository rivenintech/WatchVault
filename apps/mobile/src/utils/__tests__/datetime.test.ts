import { formatDate, formatTime, getAge } from "../datetime";

describe("getAge", () => {
  const currentDate = new Date("2025-01-10");
  jest.useFakeTimers().setSystemTime(currentDate);

  // Test case for valid dates
  it("should correctly calculate age for a valid birthday", () => {
    const birthday = "1990-01-01";
    expect(getAge(birthday)).toBe(35); // 2025 - 1990 = 35
  });

  it("should correctly calculate age for a valid birthday with month and day adjustments", () => {
    const birthday = "1990-12-31";
    expect(getAge(birthday)).toBe(34); // In 2025, the person has not yet had their birthday
  });

  it("should correctly calculate age when the birthday is today", () => {
    const birthday = "1990-01-10";
    expect(getAge(birthday)).toBe(35); // It's the person's birthday today
  });

  // Test case for invalid date format
  it("should throw an error for an invalid date format", () => {
    expect(() => getAge("invalid-date")).toThrow("Invalid date format");
  });

  // Test case for a future date
  it("should return 0 if the birthday is in the future", () => {
    const futureBirthday = "2030-01-01";
    expect(getAge(futureBirthday)).toBe(0);
  });

  // Test case for when the birthday is in the future in the current year
  it("should calculate age correctly if the birthday has not yet occurred this year", () => {
    const birthday = "2024-12-31";
    expect(getAge(birthday)).toBe(0); // Birthday will be in 2024, so the person is 0 years old on 2025-01-10
  });
});

describe("formatTime", () => {
  describe("formatTime function", () => {
    it("should return empty string for invalid minutes value (NaN)", () => {
      expect(formatTime(NaN)).toBe("");
    });

    it("should return empty string for minutes value equal to 0", () => {
      expect(formatTime(0)).toBe("");
    });

    it("should return minutes only for minutes value less than 60", () => {
      expect(formatTime(30)).toBe("30m");
    });

    it("should return hours and minutes for minutes value greater than or equal to 60", () => {
      expect(formatTime(90)).toBe("1h 30m");
    });

    it("should return hours only for minutes value equal to multiple of 60", () => {
      expect(formatTime(120)).toBe("2h");
    });
  });
});

describe("formatDate", () => {
  beforeAll(() => {
    const originalDateTimeFormat = Intl.DateTimeFormat;

    jest.spyOn(global.Intl, "DateTimeFormat").mockImplementation((locale, options) => {
      // Force the locale to "en-US" regardless of what is passed
      return new originalDateTimeFormat("en-US", { timeZone: "UTC", ...options });
    });
  });

  afterAll(() => {
    // Restore the original implementation of Intl.DateTimeFormat
    jest.restoreAllMocks();
  });

  it("should format a valid date string with different formats", () => {
    const date = "2022-07-25";
    expect(formatDate(date, "full")).toContain("Monday, July 25, 2022");
    expect(formatDate(date, "long")).toContain("July 25, 2022");
    expect(formatDate(date, "medium")).toContain("Jul 25, 2022");
    expect(formatDate(date, "short")).toContain("7/25/22");
  });

  it("should return an empty string for an invalid date string", () => {
    const invalidDates = ["not-a-date", ""];

    invalidDates.forEach((date) => {
      expect(formatDate(date, "full")).toBe("");
    });
  });

  it("should handle timezone edge case/date with time", () => {
    const date = "2999-12-31T23:59:59.000Z";
    const expected = "Tuesday, December 31, 2999";
    expect(formatDate(date, "full")).toBe(expected);
  });
});
