import React, { createContext, useContext } from 'react';

// Theme context removed - app is now light-mode only (Minimalist Monochrome)
const ThemeContext = createContext({ isDarkMode: false, toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {
    return (
        <ThemeContext.Provider value={{ isDarkMode: false, toggleTheme: () => {} }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
