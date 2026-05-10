import { ReactNode, useState, useMemo } from 'react'

import { FrostedSurfaceIntensity, ThemePalette } from '@audius/common/models'
import { MediaProvider } from '@audius/harmony/src/contexts'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider as ReduxProvider } from 'react-redux'
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider
} from 'react-router'
import { PersistGate } from 'redux-persist/integration/react'

import {
  REACT_QUERY_DEVTOOLS_KEY,
  useDevToggle
} from 'hooks/useDevToggle'
import { useIsMobile } from 'hooks/useIsMobile'
import { env } from 'services/env'
import { queryClient } from 'services/query-client'
import { configureStore } from 'store/configureStore'
import {
  getFrostedSurfaceIntensityFromStorage,
  getSystemAppearance,
  getTheme,
  getThemeModeFromStorage,
  getThemePaletteFromStorage
} from 'utils/theme/theme'

import { createRoutes } from './routes'

type AppProvidersProps = {
  children?: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const isMobile = useIsMobile()
  // Floating React Query devtools button — off by default, opt-in via
  // /dev-tools so it doesn't sit in the corner of the app for normal users.
  const [reactQueryDevtoolsEnabled] = useDevToggle(
    REACT_QUERY_DEVTOOLS_KEY,
    false
  )

  const [{ store, persistor }] = useState(() => {
    const theme = getTheme()
    const themePalette = getThemePaletteFromStorage() ?? ThemePalette.DEFAULT
    const themeMode = getThemeModeFromStorage()
    const frostedSurfaceIntensity =
      getFrostedSurfaceIntensityFromStorage() ?? FrostedSurfaceIntensity.DEFAULT
    const initialStoreState = {
      ui: {
        theme: {
          theme,
          themePalette,
          themeMode,
          frostedSurfaceIntensity,
          systemAppearance: getSystemAppearance()
        }
      }
    }

    const { store, persistor } = configureStore({ isMobile, initialStoreState })
    // Mount store to window for easy access
    if (typeof window !== 'undefined' && !window.store) {
      window.store = store
    }
    return { store, persistor }
  })

  const basename = env.BASENAME || undefined

  // Create router with data router API for code-splitting and performance
  const router = useMemo(() => {
    const routes = createRoutes()
    const createRouter = env.USE_HASH_ROUTING
      ? createHashRouter
      : createBrowserRouter

    return createRouter(routes, {
      basename
    })
  }, [basename])

  return (
    <QueryClientProvider client={queryClient}>
      <MediaProvider>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <RouterProvider router={router} />
          </PersistGate>
        </ReduxProvider>
      </MediaProvider>
      {reactQueryDevtoolsEnabled ? <ReactQueryDevtools /> : null}
    </QueryClientProvider>
  )
}
