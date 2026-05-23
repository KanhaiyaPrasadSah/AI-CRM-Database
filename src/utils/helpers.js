/* GOOGLE DRIVE IMAGE FORMATTER */
export const getBestImageUrl = (url) => {
  if (!url) return "";

  try {
    const cleanUrl = url.toString().trim();

    if (cleanUrl.startsWith("data:image")) {
      return cleanUrl;
    }

    if (cleanUrl.includes("drive.google.com")) {
      let fileId = "";

      if (cleanUrl.includes("/file/d/")) {
        fileId = cleanUrl
          .split("/file/d/")[1]
          .split("/")[0];
      } else if (cleanUrl.includes("id=")) {
        fileId = cleanUrl
          .split("id=")[1]
          .split("&")[0];
      }

      if (fileId) {
        return `https://docs.google.com/uc?export=view&id=${fileId}`;
      }
    }

    return cleanUrl;
  } catch (err) {
    console.error("Image parsing error:", err);
    return url;
  }
};

/* FORMAT TIMESTAMP */
export const formatTimestampWithDay = (
  timestampStr
) => {
  if (!timestampStr) return "N/A";

  try {
    const cleanTs = timestampStr
      .toString()
      .split(".")[0]
      .replace("Z", "")
      .replace("T", " ");

    const dateObj = new Date(
      cleanTs.replace(/-/g, "/")
    );

    if (isNaN(dateObj.getTime())) {
      return timestampStr;
    }

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayName = daysOfWeek[dateObj.getDay()];

    return `${dayName}, ${cleanTs}`;
  } catch (e) {
    return timestampStr;
  }
};

/* DAYS INTERVAL */
export const calculateDaysInterval = (
  pastTimestampStr,
  currentTimestampStr
) => {
  if (!pastTimestampStr || !currentTimestampStr) {
    return 0;
  }

  try {
    const cleanPast = pastTimestampStr
      .toString()
      .split(".")[0]
      .replace("Z", "")
      .replace("T", " ")
      .replace(/-/g, "/");

    const cleanCurrent = currentTimestampStr
      .toString()
      .split(".")[0]
      .replace("Z", "")
      .replace("T", " ")
      .replace(/-/g, "/");

    const pastDate = new Date(cleanPast);
    const currentDate = new Date(cleanCurrent);

    if (
      isNaN(pastDate.getTime()) ||
      isNaN(currentDate.getTime())
    ) {
      return 0;
    }

    const diffTime = Math.abs(
      currentDate - pastDate
    );

    const diffDays = Math.floor(
      diffTime / (1000 * 60 * 60 * 24)
    );

    return diffDays;
  } catch (e) {
    console.error("Days interval error:", e);
    return 0;
  }
};