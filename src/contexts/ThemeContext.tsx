import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  isOutdoorMode: boolean;
  toggleOutdoorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isOutdoorMode: false,
  toggleOutdoorMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isOutdoorMode, setIsOutdoorMode] = useState<boolean>(() => {
    return localStorage.getItem("matisa_theme_outdoor") === "true";
  });

  useEffect(() => {
    localStorage.setItem("matisa_theme_outdoor", String(isOutdoorMode));
    if (isOutdoorMode) {
      document.documentElement.classList.add("light-outdoor");
      document.body.classList.add("light-outdoor");
    } else {
      document.documentElement.classList.remove("light-outdoor");
      document.body.classList.remove("light-outdoor");
    }
  }, [isOutdoorMode]);

  const toggleOutdoorMode = () => setIsOutdoorMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isOutdoorMode, toggleOutdoorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
