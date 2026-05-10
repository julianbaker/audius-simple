import { createContext, useContext } from 'react'

type NavSidebarContextType = {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export const NavSidebarContext = createContext<NavSidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {}
})

export const useNavSidebar = () => useContext(NavSidebarContext)
