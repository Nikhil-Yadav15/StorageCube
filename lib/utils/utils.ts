import { localStorageService } from "@/services/LocalStorage.service";
import { apiUrls } from "@/tools/apiUrls";
import { createHttpClient } from "@/tools/httpClient";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const parseStringify = (value: unknown) =>
  JSON.parse(JSON.stringify(value));

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const convertFileSize = (sizeInBytes: number, digits?: number) => {
  if (sizeInBytes < 1024) {
    return sizeInBytes + " MB"; // Less than 1 KB, show in Bytes
  } else if (sizeInBytes < 1024 * 1024) {
    const sizeInKB = sizeInBytes / 1024;
    return sizeInKB.toFixed(digits || 1) + " KB"; // Less than 1 MB, show in KB
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB.toFixed(digits || 1) + " MB"; // Less than 1 GB, show in MB
  } else {
    const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
    return sizeInGB.toFixed(digits || 1) + " GB"; // 1 GB or more, show in GB
  }
};

export const calculatePercentage = (sizeInBytes: number) => {
  const totalSizeInBytes = 1 * 1024 * 1024 * 1024; // 2GB in bytes
  const percentage = (sizeInBytes / totalSizeInBytes) * 100;
  return Number(percentage.toFixed(2));
};

export const getFileType = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) return { type: "other", extension: "" };

  const documentExtensions = [
    "pdf",
    "doc",
    "docx",
    "txt",
    "xls",
    "xlsx",
    "csv",
    "rtf",
    "ods",
    "ppt",
    "odp",
    "md",
    "html",
    "htm",
    "epub",
    "pages",
    "fig",
    "psd",
    "ai",
    "indd",
    "xd",
    "sketch",
    "afdesign",
    "afphoto",
    "afphoto",
  ];
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const videoExtensions = ["mp4", "avi", "mov", "mkv", "webm"];
  const audioExtensions = ["mp3", "wav", "ogg", "flac"];

  if (documentExtensions.includes(extension))
    return { type: "document", extension };
  if (imageExtensions.includes(extension)) return { type: "image", extension };
  if (videoExtensions.includes(extension)) return { type: "video", extension };
  if (audioExtensions.includes(extension)) return { type: "audio", extension };

  return { type: "other", extension };
};

export const formatDateTime = (isoString: string | null | undefined) => {
  if (!isoString) return "—";

  const date = new Date(isoString);

  // Get hours and adjust for 12-hour format
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "pm" : "am";

  // Convert hours to 12-hour format
  hours = hours % 12 || 12;

  // Format the time and date parts
  const time = `${hours}:${minutes.toString().padStart(2, "0")}${period}`;
  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];

  return `${time}, ${day} ${month}`;
};

export const getFileIcon = (
  extension: string | undefined,
  type: any | string
) => {
  switch (extension) {
    // Document
    case "pdf":
      return "/assets/icons/file-pdf.svg";
    case "doc":
      return "/assets/icons/file-doc.svg";
    case "docx":
      return "/assets/icons/file-docx.svg";
    case "csv":
      return "/assets/icons/file-csv.svg";
    case "txt":
      return "/assets/icons/file-txt.svg";
    case "xls":
    case "xlsx":
      return "/assets/icons/file-document.svg";
    // Image
    case "svg":
      return "/assets/icons/file-image.svg";
    // Video
    case "mkv":
    case "mov":
    case "avi":
    case "wmv":
    case "mp4":
    case "flv":
    case "webm":
    case "m4v":
    case "3gp":
      return "/assets/icons/file-video.svg";
    // Audio
    case "mp3":
    case "mpeg":
    case "wav":
    case "aac":
    case "flac":
    case "ogg":
    case "wma":
    case "m4a":
    case "aiff":
    case "alac":
      return "/assets/icons/file-audio.svg";

    default:
      switch (type) {
        case "image":
          return "/assets/icons/file-image.svg";
        case "document":
          return "/assets/icons/file-document.svg";
        case "video":
          return "/assets/icons/file-video.svg";
        case "audio":
          return "/assets/icons/file-audio.svg";
        default:
          return "/assets/icons/file-other.svg";
      }
  }
};

// DASHBOARD UTILS
export const getUsageSummary = (totalSpace: any) => {
  return [
    {
      title: "Documents",
      size: totalSpace.document?.size,
      latestDate: totalSpace.document?.latestDate,
      icon: "/assets/icons/file-document-light.svg",
      url: "/documents",
    },
    {
      title: "Images",
      size: totalSpace.image?.size,
      latestDate: totalSpace.image?.latestDate,
      icon: "/assets/icons/file-image-light.svg",
      url: "/images",
    },
    {
      title: "Media",
      size: totalSpace.video?.size + totalSpace.audio?.size,
      latestDate:
        totalSpace.video?.latestDate > totalSpace.audio?.latestDate
          ? totalSpace.video?.latestDate
          : totalSpace.audio?.latestDate,
      icon: "/assets/icons/file-video-light.svg",
      url: "/media",
    },
    {
      title: "Others",
      size: totalSpace.other?.size,
      latestDate: totalSpace.other?.latestDate,
      icon: "/assets/icons/file-other-light.svg",
      url: "/others",
    },
  ];
};

export const getFileTypesParams = (type: string) => {
  switch (type) {
    case "documents":
      return ["document"];
    case "images":
      return ["image"];
    case "media":
      return ["video", "audio"];
    case "others":
      return ["other"];
    default:
      return ["document"];
  }
};

const refreshAccessToken = async () => {
  const httpClient = createHttpClient();
  try {
    const refreshToken = localStorageService.getRefreshToken();
    const response = await httpClient.post(apiUrls.refreshAccessToken, {
      refreshToken,
    });

    if (!response || response.status !== 200) {
      localStorageService.clearLocalStorage();
      throw new Error("Failed to refresh token");
    }

    localStorageService.setAccessToken(response.data.accessToken);
    localStorageService.setRefreshToken(response.data.refreshToken);
    return response.data;
  } catch (error) {
    localStorageService.clearLocalStorage();
    console.log("Token refresh failed:", error);
    return null;
  }
};

const renameFile = async (id: string, name: string) => {
  const httpClient = createHttpClient();
  try {
    const response = await httpClient.put(`${apiUrls.getFile}/${id}/rename`, {
      name,
    });

    console.log("response", response);

    return response;

    if (!response || response.status !== 200) {
      return {
        success: false,
        message: response?.message || "Failed to rename file",
      };
    }

    if (response && response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.log("error at rename", error);
    return null;
  }
};

const updateFileUsers = async (id: string, emails: string[] | string) => {
  const httpClient = createHttpClient();
  try {
    const response = await httpClient.put(`${apiUrls.getFile}/${id}/share`, {
      emails,
    });

    if (!response || response.status !== 200) {
      return {
        success: false,
        message: response?.message || "Failed to share file",
      };
    }

    return response;

    if (response && response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.log("error at rename", error);
    return null;
  }
};

const deleteFile = async (id: string) => {
  const httpClient = createHttpClient();
  try {
    const response = await httpClient.delete(`${apiUrls.getFile}/${id}/delete`);

    if (!response || response.status !== 200) {
      return {
        success: false,
        message: response?.message || "Failed to delete file",
      };
    }

    return response;

    if (response && response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.log("error at rename", error);
    return null;
  }
};

const sliceFileName = (name: string) => {
  const width = window.innerWidth;
  switch (true) {
    case width < 300: {
      console.log("name", name);
      return name.slice(0, 10) + "...";
    }
    case width < 400:
      return name.slice(0, 15) + "...";
    case width < 600:
      return name.slice(0, 30) + "...";
    case width < 900:
      return name.slice(0, 50) + "...";
    default:
      console.log("name", name);
      return name;
  }
};

export const utils = {
  refreshAccessToken,
  renameFile,
  updateFileUsers,
  deleteFile,
  sliceFileName,
};
