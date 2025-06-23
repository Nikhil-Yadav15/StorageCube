"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { sortTypes } from "@/constants";

const Sort = () => {
  const path = usePathname();
  const searchParams = useSearchParams();
  const searchText = searchParams.get("query") || "";
  const sort = searchParams.get("sort") || "";
  const router = useRouter();

  const handleSort = (value: string) => {
    router.push(`${path}?query=${searchText}&sort=${value}`);
  };

  return (
    <Select
      onValueChange={handleSort}
      defaultValue={sort || sortTypes[0].value}
    >
      <SelectTrigger className="sort-select">
        <SelectValue placeholder={sortTypes[0].value} />
      </SelectTrigger>
      <SelectContent className="sort-select-content">
        {sortTypes.map((sort) => (
          <SelectItem
            key={sort.label}
            className="shad-select-item"
            value={sort.value}
          >
            {sort.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Sort;
