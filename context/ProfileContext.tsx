"use client";
import { apiUrls } from "@/tools/apiUrls";
import { createHttpClient } from "@/tools/httpClient";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useToast } from "@/hooks/use-toast";

interface ProfileContextType {
  profile: IProfile;
  setProfile: Dispatch<SetStateAction<IProfile>>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = useState({
    _id: "",
    email: "",
    fullName: "",
    avatar: "",
    totalSpace: 0,
    totalSpaceUsed: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const httpClient = createHttpClient();

    try {
      const user = await httpClient.get(apiUrls.profile);

      if (!user || user.status !== 200) {
        toast({
          description: (
            <p className="body-2 text-white">
              {user?.message ||
                `Something went wrong while fetching profile details`}
            </p>
          ),
          className: "error-toast",
        });
        return;
      }

      setProfile(user.data.user);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Create a custom hook to access context
export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === null) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
}
