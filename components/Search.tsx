"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { createHttpClient } from "@/tools/httpClient";
import { apiUrls } from "@/tools/apiUrls";


const Search = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const sort = searchParams.get("sort") || "";
  const [query, setQuery] = useState(searchQuery);
  const [results, setResults] = useState<IDocument[]>([]);
  const [cacheResults, setCacheResults] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false); // Tracks first-load behavior
  const router = useRouter();
  const latestQuery = useRef("");

  const handleFocus = () => setOpen(true);

  useEffect(() => {
    const handleBlur = () => {
      setTimeout(() => {
        setOpen(false);
      }, 250);
    };

    const searchBar = document.getElementById("searchbar") as HTMLElement;
    searchBar.addEventListener("blur", handleBlur);

    return () => searchBar.removeEventListener("blur", handleBlur);
  }, [open]);

  useEffect(() => {
    if (searchQuery === "") {
      setQuery("");
      setResults([]);
    }
    setInitialized(false);
  }, [searchQuery]);

  useEffect(() => {
    latestQuery.current = query;

    if (query.trim() === "") {
      setResults([]);
      setOpen(false);
      return;
    }

    let timer: NodeJS.Timeout;
    if (cacheResults[query]) {
      setResults(cacheResults[query]);
      if (initialized) {
        setOpen(true);
      }
    } else {
      timer = setTimeout(() => fetchFiles(query), 200);
    }

    return () => clearTimeout(timer);
  }, [query]);

  const fetchFiles = async (currentQuery: string) => {
    const httpClient = createHttpClient();

    try {
      const response = await httpClient.get(
        `${apiUrls.getFile}/all?searchText=${currentQuery}`
      );

      if (!response || response.status !== 200) {
        throw new Error("Failed to fetch files");
      }

      // Ensure the response is for the latest query
      if (latestQuery.current !== currentQuery) return;

      setResults(response.data.files);
      setCacheResults({
        ...cacheResults,
        [currentQuery]: response.data.files,
      });

      if (initialized) {
        setOpen(true);
      }
    } catch (error) {
      console.log("Error fetching files:", error);
    }
  };

  const handleClickItem = (file: IDocument) => {
    setOpen(false);
    setInitialized(false);

    const url = `/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`;
    sort === "" ? router.push(url) : router.push(`${url}&sort=${sort}`);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setInitialized(true);
  };

  return (
    <div className="search flex flex-row">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="Search"
          width={24}
          height={24}
          />
        <Input
          id="searchbar"
          value={query}
          placeholder="Search..."
          className="search-input"
          onChange={handleInputChange}
          onFocus={handleFocus}
          />

        {open && (
          <ul className="search-result max-h-[400px] overflow-y-scroll">
            
            {results.length > 0 ? (
              results.map((file) => (
                <li
                  className="flex items-center justify-between"
                  key={file._id}
                  onClick={() => handleClickItem(file)}
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>

                  <FormattedDateTime
                    date={file.createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result">No files found</p>
            )}
          </ul>
        )}
      </div>

    </div>
  );
};

export default Search;
