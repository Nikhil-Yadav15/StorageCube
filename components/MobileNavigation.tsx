"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Separator } from "@radix-ui/react-separator";
import { navItems } from "@/constants";
import Link from "next/link";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/FileUploader";
import { LogoBrand, Logout, Menu } from "@/public/assets";
import { useProfileContext } from "@/context/ProfileContext";
import { createHttpClient } from "@/tools/httpClient";
import { apiUrls } from "@/tools/apiUrls";
import { localStorageService } from "@/services/LocalStorage.service";
import PlanPopup from "./PaymentFrontend";

const MobileNavigation = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const {
    profile: { fullName, avatar, email },
  } = useProfileContext();

  const onLogout = async () => {
    const httpClient = createHttpClient();

    try {
      const response = await httpClient.post(apiUrls.logout, {});
      if (response && response.status === 200) {
        localStorageService.clearLocalStorage();

        router.push("/sign-in");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <header className="mobile-header">
      <div className="flex items-center space-x-3">
        <Image
          src={LogoBrand}
          alt="logo"
          width={42}
          height={42}
          className="h-auto"
        />
        <h1 className="text-[24px] leading-[30px] font-medium text-indigo-100">
          StorageCube
        </h1>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image src={Menu} alt="Search" width={30} height={30} />
        </SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetTitle>
            <div className=" header-user">
              <Image
                src={avatar}
                alt="avatar"
                width={44}
                height={44}
                className="header-user-avatar"
              />
              <div className=" sm:hidden lg:block">
                <p className="text-white subtitle-2 capitalize">{fullName}</p>
                <p className="caption">{email}</p>
              </div>
            </div>
            <Separator className="mb-4 bg-light-200/20" />
          </SheetTitle>

          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map(({ url, name, icon }) => (
                <Link
                  key={name} href={url} className="lg:w-full"
                  onClick={() => setOpen(false)}
                >
                  <li
                    className={cn(
                      "mobile-nav-item",
                      pathname === url && "shad-active"
                    )}
                  >
                    <Image
                      src={icon}
                      alt={name}
                      width={24}
                      height={24}
                      className={cn(
                        "nav-icon",
                        pathname === url && "nav-icon-active"
                      )}
                    />
                    <p>{name}</p>
                  </li>
                </Link>
              ))}
            </ul>
          </nav>

          <Separator className="my-5 bg-light-200/20" />

          <div className="flex flex-col gap-5 pb-10">
            <FileUploader />
            <Button
              type="submit"
              className="mobile-sign-out-button"
              onClick={onLogout}
            >
              <Image src={Logout} alt="logo" width={24} height={24} />
              <p>Logout</p>
            </Button>
          </div>
          <div className="sticky bottom-0 bg-background pt-4 pb-6 border-t border-light-200/20">

          <PlanPopup/>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;
