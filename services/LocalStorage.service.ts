const setAccessToken = (accessToken: string) => {
  localStorage.setItem("accessToken", accessToken);
};

const setRefreshToken = (refreshToken: string) => {
  localStorage.setItem("refreshToken", refreshToken);
};

const getAccessToken = () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken !== null) {
      return accessToken;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving access token:", error);
    return null;
  }
};

const getRefreshToken = () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken !== null) {
      return refreshToken;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    return null;
  }
};

const removeAccessToken = () => {
  try {
    localStorage.removeItem("accessToken");
  } catch (error) {}
};

const removeRefreshToken = () => {
  try {
    localStorage.removeItem("refreshToken");
  } catch (error) {}
};

const clearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {}
};

const localStorageService = {
  setAccessToken,
  getAccessToken,
  removeAccessToken,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
  clearLocalStorage,
};

export { localStorageService };
