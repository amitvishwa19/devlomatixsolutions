import { createContext, useContext, useState } from 'react';

const RouterContext = createContext({
  currentPath: "/",
  navigate: (path: string) => {},
});

export const SocialRouter = ({ children }: { children: React.ReactNode }) => {
  const [currentPath, setCurrentPath] = useState("/");
  return <RouterContext.Provider value={{ currentPath, navigate: setCurrentPath }}>{children}</RouterContext.Provider>;
}

export const useSocialRouter = () => useContext(RouterContext);

export const useLocation = () => {
  const { currentPath } = useSocialRouter();
  return { pathname: currentPath };
}
