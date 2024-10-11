import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ThemeColors {
  headerBackground: string;
  headerText: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  background: string;
  statusBarColor: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const lightTheme: ThemeColors = {
  headerBackground: '#ffffff',
  headerText: '#000000',
  tabBarBackground: '#ffffff',
  tabBarActive: '#000000',
  tabBarInactive: '#8E8E93',
  background: '#ffffff',
  statusBarColor: '#ffffff',
};

const darkTheme: ThemeColors = {
  headerBackground: '#000000',
  headerText: '#ffffff',
  tabBarBackground: '#000000',
  tabBarActive: '#ffffff',
  tabBarInactive: '#8E8E93',
  background: '#000000',
  statusBarColor: '#ffffff',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const colors = isDarkMode ? darkTheme : lightTheme;

  return <ThemeContext.Provider value={{ colors, toggleTheme, isDarkMode }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
