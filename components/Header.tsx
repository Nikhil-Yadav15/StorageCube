"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { Logout } from "@/public/assets";
import Search from "./Search";
import FileUploader from "./FileUploader";
import { createHttpClient } from "@/tools/httpClient";
import { apiUrls } from "@/tools/apiUrls";
import { localStorageService } from "@/services/LocalStorage.service";
import { useRouter } from "next/navigation";
import PlanPopup from "./PaymentFrontend";

const Header = () => {
  const router = useRouter();

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
    <header className="header">
      <Search />
      <PlanPopup/>
      <div className="header-wrapper">
        <FileUploader />
        <Button type="submit" className="sign-out-button" onClick={onLogout}>
          <Image
            src={Logout}
            alt="sign out"
            width={24}
            height={24}
            className="w-6"
          />
        </Button>
      </div>
    </header>
  );
};

export default Header;
