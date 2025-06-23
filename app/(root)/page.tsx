"use client";

import Image from "next/image";
import Link from "next/link";
import ActionDropdown from "@/components/ActionDropdown";
import Chart from "@/components/Chart";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import Thumbnail from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";
import { convertFileSize, getUsageSummary } from "@/lib/utils/utils";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchFiles();
    fetchTotalSpaceUsed();
  }, []);

  const fetchFiles = async () => {
    const httpClient = createHttpClient();
    try {
      const response = await httpClient.get(`${apiUrls.getFile}/all?limit=10`);

      if (!response || response.status !== 200) {
        toast({
          description: (
            <p className="body-2 text-white">
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
      console.log("Error fetching files:", error);
    }
  };

  const fetchTotalSpaceUsed = async () => {
    const httpClient = createHttpClient();
    try {
      const response = await httpClient.get(apiUrls.getTotalSpaceUsed);
      if (!response || response.status !== 200) {
        toast({
          description: (
            <p className="body-2 text-white">
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
      console.log("Error fetching files:", error);
    }
  };

  // Get usage summary
  const usageSummary = getUsageSummary(totalSpace);

  return (
    <div className="dashboard-container">
      <section>
        <Chart used={totalSpace.used} />

        {/* Uploaded file type summaries */}
        <ul className="dashboard-summary-list">
          {usageSummary.map((summary) => (
            <Link
              href={summary.url}
              key={summary.title}
              className="dashboard-summary-card"
            >
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  <Image
                    src={summary.icon}
                    width={100}
                    height={100}
                    alt="uploaded image"
                    className="summary-type-icon"
                  />
                  <h4 className="summary-type-size">
                    {convertFileSize(summary.size) || 0}
                  </h4>
                </div>

                <h5 className="summary-type-title">{summary.title}</h5>
                <Separator className="bg-light-400" />
                <FormattedDateTime
                  date={summary.latestDate}
                  className="text-center"
                />
              </div>
            </Link>
          ))}
        </ul>
      </section>

      {/* Recent files uploaded */}
      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-light-100">Recent files uploaded</h2>
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
                <div className="recent-file-details">
                  <div className="flex flex-col gap-1">
                    <p className="recent-file-name">{file.name}</p>
                    <FormattedDateTime
                      date={file.createdAt}
                      className="caption"
                    />
                  </div>
                  <ActionDropdown file={file} fetchFiles={fetchFiles} />
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="empty-list">No files uploaded</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
