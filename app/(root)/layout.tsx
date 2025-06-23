import { ReactNode } from "react";
import { ProfileProvider } from "@/context/ProfileContext";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <ProfileProvider>
      <main className="flex h-screen">
        <Sidebar />
        <section className="flex h-full flex-1 flex-col">
          <MobileNavigation />
          <Header />
          <div className="main-content ">
            {children}
          </div>
        </section>
      </main>
    </ProfileProvider>
  );
};

export default Layout;
