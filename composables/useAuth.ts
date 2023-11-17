import { jwtDecode } from "jwt-decode";

export default () => {
  const useAuthToken = () => useState<string>("auth_token");
  const useAuthUser = () => useState<string>("auth_user");
  const useAuthLoading = () => useState<boolean>("auth_loading");

  const setToken = (newToken: string) => {
    const authToken = useAuthToken();
    authToken.value = newToken;
  };

  const setUser = (newUser: string) => {
    const authUser = useAuthUser();
    authUser.value = newUser;
  };

  const setIsAuthLoading = (isLoading: boolean) => {
    const authLoading = useAuthLoading();
    authLoading.value = isLoading;
  };

  const login = ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data: any = await $fetch("/api/auth/login", {
          method: "POST",
          body: {
            username,
            password,
          },
        });

        setToken(data.access_token);
        setUser(data.user);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  const refreshToken = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const data: any = await $fetch("/api/auth/refresh");

        setToken(data.access_token);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  const getUser = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const data: any = await useFetchApi("/api/auth/user");
        setUser(data.user);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  const reRefreshAccessToken = () => {
    const authToken = useAuthToken();

    if (!authToken.value) return;
    const jwt = jwtDecode(authToken.value);
    const newRefreshTime = jwt.exp! - 60000;

    setTimeout(async () => {
      await refreshToken();
      reRefreshAccessToken();
    }, newRefreshTime);
  };

  const initAuth = () => {
    return new Promise(async (reslve, reject) => {
      setIsAuthLoading(true);
      try {
        await refreshToken();
        await getUser();
        reRefreshAccessToken();
        reslve(true);
      } catch (error) {
        console.log(error);
        reject(error);
      } finally {
        setIsAuthLoading(false);
      }
    });
  };

  const logout = () => {
    return new Promise(async (resolve, reject) => {
      try {
        await useFetchApi("/api/auth/logout", {
          method: "POST",
        });
        setToken("");
        setUser("");
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  return {
    login,
    useAuthUser,
    useAuthToken,
    initAuth,
    useAuthLoading,
    logout,
  };
};
