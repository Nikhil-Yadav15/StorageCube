"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";
import { utils } from "@/lib/utils/utils";
import { useToast } from "@/hooks/use-toast";

interface Props {
  file: IDocument;
  fetchFiles: () => Promise<void>;
}

type ActionType = {
  value: string;
  label: string;
  icon: string;
};

const ActionDropdown = ({ file, fetchFiles }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);

  const { toast } = useToast();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);

    try {
      let response;
      switch (action.value) {
        case "rename":
          response = await utils.renameFile(file._id, name);
          break;
        case "share":
          response = await utils.updateFileUsers(file._id, emails);
          break;
        case "delete":
          response = await utils.deleteFile(file._id);
          break;
        default:
          throw new Error("Invalid action");
      }

      if (response.status !== 200) {
        throw new Error(response?.message || "Something went wrong");
      }

      closeAllModals();
      await fetchFiles();
    } catch (error) {
      toast({
        description: (
          <p className="body-2 text-white">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        ),
        className: "error-toast",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    try {
      await utils.updateFileUsers(file._id, email);
      await fetchFiles();
    } catch (error) {
      console.error("Failed to remove user:", error);
    }
  };

  const handleActionClick = (actionItem: ActionType) => {
    setAction(actionItem);
    if (["rename", "share", "delete", "details"].includes(actionItem.value)) {
      setIsModalOpen(true);
    }
  };

  const renderDialogContent = () => {
    if (!action) return null;

    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {action.label}
          </DialogTitle>
          {action.value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {action.value === "details" && <FileDetails file={file} />}
          {action.value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {action.value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{" "}
              <span className="delete-file-name">{file.name}</span>?
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(action.value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{action.value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => handleActionClick(actionItem)}
            >
              {actionItem.value === "download" ? (
                <Link
                  href={file.url}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
