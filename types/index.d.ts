declare type FileType = "document" | "image" | "video" | "audio" | "other";

declare interface ActionType {
  label: string;
  icon: string;
  value: string;
}

declare interface IProfile {
  _id: string;
  email: string;
  fullName: string;
  avatar: string;
  totalSpace: number;
  totalSpaceUsed: number;
}

declare interface IOwner {
  fullName: string;
  email: string;
  avatar: string;
}

declare interface IDocument {
  _id: string;
  name: string;
  url: string;
  type: FileType;
  extension: string;
  size: number;
  owner: IOwner;
  createdAt: string;
  updatedAt: string;
  users: IOwner[];
}

declare interface IFile {
  documents: IDocument[];
  total: number;
}
