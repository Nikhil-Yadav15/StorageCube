"use client";

import Image from "next/image";
import Link from "next/link";
import ActionDropdown from "@/components/ActionDropdown";
import Chart from "@/components/Chart";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import Thumbnail from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";
import { convertFileSize, getUsageSummary } from "@/lib/utils/utils";
import { useEffect, useState, useCallback } from "react";
import { createHttpClient } from "@/tools/httpClient";
import { apiUrls } from "@/tools/apiUrls";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [files, setFiles] = useState<IFile>({ documents: [], total: 0 });
  const [totalSpace, setTotalSpace] = useState({
    image: { size: 0, latestDate: "" },
    document: { size: 0, latestDate: "" },
    video: { size: 0, latestDate: "" },
    audio: { size: 0, latestDate: "" },
    other: { size: 0, latestDate: "" },
    used: 0,
  });

  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    const httpClient = createHttpClient();
    try {
      const response = await httpClient.get(`${apiUrls.getFile}/all?limit=10`);

      if (!response || response.status !== 200) {
        toast({
          description: (
            <p className="text-white body-2">
              {response?.message ||
                `Something went wrong while fetching recent files`}
            </p>
          ),
          className: "error-toast",
        });
        return;
      }

      setFiles({
        documents: response.data.files,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [toast]);

  const fetchTotalSpaceUsed = useCallback(async () => {
    const httpClient = createHttpClient();
    try {
      const response = await httpClient.get(apiUrls.getTotalSpaceUsed);
      if (!response || response.status !== 200) {
        toast({
          description: (
            <p className="text-white body-2">
              {response?.message ||
                `Something went wrong while fetching total space used`}
            </p>
          ),
          className: "error-toast",
        });
        return;
      }
      setTotalSpace(response.data.totalSpace);
    } catch (error) {
      console.error("Error fetching total space used:", error);
    }
  }, [toast]);

  useEffect(() => {
    fetchFiles();
    fetchTotalSpaceUsed();
  }, [fetchFiles, fetchTotalSpaceUsed]);

  // Get usage summary
  const usageSummary = getUsageSummary(totalSpace);

  return (
    <div className="dashboard-container">
      <section>
        <Chart used={totalSpace.used} />

        {/* Uploaded file type summaries */}
        <ul className="flex flex-wrap gap-5">
          {usageSummary.map((summary) => (
            <Link
              href={summary.url}
              key={summary.title}
              className="glass-card-hover w-full min-w-[200px] max-w-[300px] rounded-lg p-4 shadow-md transition-all hover:shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  <Image
                    src={summary.icon}
                    width={100}
                    height={100}
                    alt="uploaded image"
                    className="h-10 w-10"
                  />
                  <h4 className="text-lg font-medium">
                    {convertFileSize(summary.size) || 0}
                  </h4>
                </div>

                <h5 className="text-xl font-semibold">{summary.title}</h5>
                <Separator className="bg-light-400" />
                <FormattedDateTime
                  date={summary.latestDate}
                  className="text-center text-sm"
                />
              </div>
            </Link>
          ))}
        </ul>
      </section>

      {/* Recent files uploaded */}
      <section className="mt-10">
        <h2 className="h2 text-light-100">Recent files uploaded</h2>
        {files.documents.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {files.documents.map((file) => (
              <Link
                href={file.url}
                target="_blank"
                className="flex items-center gap-3"
                key={file._id}
              >
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={file.url}
                />
                <div className="flex flex-1 items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-medium">{file.name}</p>
                    <FormattedDateTime
                      date={file.createdAt}
                      className="text-sm text-gray-500"
                    />
                  </div>
                  <ActionDropdown file={file} fetchFiles={fetchFiles} />
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="py-10 text-center text-gray-500">No files uploaded</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
