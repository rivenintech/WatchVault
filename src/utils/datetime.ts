export function getAge(birthday: string) {
    const birthDate = new Date(birthday);

    // Check if the date is valid
    if (Number.isNaN(birthDate.getTime())) {
        throw new Error("Invalid date format");
    }

    const today = new Date();

    // If the birthdate is in the future, return 0
    if (birthDate > today) {
        return 0;
    }

    let years = today.getFullYear() - birthDate.getFullYear();

    // Adjust years if today's date is before the birthday in the current year
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        years--;
    }

    return years;
}

export function formatTime(minutes: number) {
    if (Number.isNaN(minutes)) {
        return "";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hoursText = hours > 0 ? `${hours}h` : "";
    const minutesText = remainingMinutes > 0 ? `${remainingMinutes}m` : "";

    return [hoursText, minutesText].filter(Boolean).join(" ");
}

export function formatDate(date: string, format: "full" | "long" | "medium" | "short") {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("default", {
        dateStyle: format,
    }).format(parsedDate);
}
