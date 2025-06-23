import { MouseEvent, useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils/utils";
import Image from "next/image";
import { FileLoader, Remove, Upload } from "@/public/assets";
import Thumbnail from "./Thumbnail";
import { usePathname } from "next/navigation";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { createHttpClient } from "@/tools/httpClient";
import { apiUrls } from "@/tools/apiUrls";

interface Props {
  className?: string;
}

const FileUploader = ({ className }: Props) => {
  const path = usePathname();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const abortControllers = useRef(new Map<string, AbortController>());

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);

      acceptedFiles.forEach(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name)
          );

          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 50MB.
              </p>
            ),
            className: "error-toast",
          });
        }

        await onUploadFile(file);
      });
    },
    [path, files]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const onUploadFile = async (file: File) => {
    const httpClient = createHttpClient();
    const formData = new FormData();
    formData.append("file", file);

    const abortController = new AbortController();
    abortControllers.current.set(file.name, abortController);

    try {
      const response = await httpClient.post(apiUrls.uploadFile, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: abortController.signal, // Use the signal from AbortController
      });

      abortControllers.current.delete(file.name);

      if (response && response.status === 200) {
        setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
      }

      return response.data;
    } catch (error) {
      if (abortController.signal.aborted) {
        console.log("Upload aborted:", file.name);
      } else {
        console.error("Error uploading file:", error);
      }
    }
  };

  const onRemoveFile = (
    e: MouseEvent<HTMLImageElement, globalThis.MouseEvent>,
    fileName: string
  ) => {
    e.stopPropagation();
    const abortController = abortControllers.current.get(fileName);

    if (abortController) {
      abortController.abort(); // Cancel the upload
      abortControllers.current.delete(fileName);
    }

    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button", className)}>
        <Image src={Upload} alt="files" width={24} height={24} />
        <p>Upload</p>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading</h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li
                key={`${index}-${file.name}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  <div className="preview-item-name">
                    {file.name.slice(0, 20).concat("...")}
                    <Image
                      src={FileLoader}
                      width={80}
                      height={26}
                      alt="loader"
                    />
                  </div>
                </div>

                <Image
                  src={Remove}
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => onRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
