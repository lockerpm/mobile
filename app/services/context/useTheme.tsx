import { colorsDark, colorsLight } from "app/theme"
import React, { createContext, useContext, useState } from "react"

const ThemeContext: React.Context<{
  isDark: boolean
  setIsDark: (val: boolean) => void
  colors: typeof colorsLight | typeof colorsDark
}> = createContext({
  isDark: false,
  colors: colorsLight,
  setIsDark: (_val: boolean) => null,
})

function ThemeContextProvider({ children }) {
  const [isDark, setIsDark] = useState(false)

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        setIsDark,
        colors: isDark ? colorsDark : colorsLight,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
const useTheme = () => useContext(ThemeContext)

export { useTheme, ThemeContextProvider }
