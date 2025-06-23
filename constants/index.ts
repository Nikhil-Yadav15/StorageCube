import {
  Dashboard,
  Delete,
  Documents,
  Download,
  Edit,
  Images,
  Info,
  Others,
  Share,
  Video,
} from "@/public/assets";

export const navItems = [
  {
    name: "Dashboard",
    icon: Dashboard,
    url: "/",
  },
  {
    name: "Documents",
    icon: Documents,
    url: "/documents",
  },
  {
    name: "Images",
    icon: Images,
    url: "/images",
  },
  {
    name: "Media",
    icon: Video,
    url: "/media",
  },
  {
    name: "Others",
    icon: Others,
    url: "/others",
  },
];

export const actionsDropdownItems = [
  {
    label: "Rename",
    icon: Edit,
    value: "rename",
  },
  {
    label: "Details",
    icon: Info,
    value: "details",
  },
  {
    label: "Share",
    icon: Share,
    value: "share",
  },
  {
    label: "Download",
    icon: Download,
    value: "download",
  },
  {
    label: "Delete",
    icon: Delete,
    value: "delete",
  },
];

export const sortTypes = [
  {
    label: "Date created (newest)",
    value: "createdAt-desc",
  },
  {
    label: "Created Date (oldest)",
    value: "createdAt-asc",
  },
  {
    label: "Name (A-Z)",
    value: "name-asc",
  },
  {
    label: "Name (Z-A)",
    value: "name-desc",
  },
  {
    label: "Size (Highest)",
    value: "size-desc",
  },
  {
    label: "Size (Lowest)",
    value: "size-asc",
  },
];

export const avatarPlaceholderUrl =
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
