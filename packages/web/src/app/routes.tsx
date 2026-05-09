import React, { lazy, Suspense, useEffect } from 'react'

import { SyncLocalStorageUserProvider } from '@audius/common/api'
import { route } from '@audius/common/utils'
import type { RouteObject } from 'react-router'
import { Navigate, Outlet, useNavigate } from 'react-router'

import { RouterContextProvider } from 'components/animated-switch/RouterContextProvider'
import { HeaderContextProvider } from 'components/header/mobile/HeaderContextProvider'
import { NavProvider } from 'components/nav/mobile/NavContext'
import { ScrollProvider } from 'components/scroll-provider/ScrollProvider'
import { ToastContextProvider } from 'components/toast/ToastContext'
import { MainContentContextProvider } from 'pages/MainContentContext'
import { SomethingWrong } from 'pages/something-wrong/SomethingWrong'
import { localStorage } from 'services/local-storage'
import { setNavigateRef } from 'store/navigationMiddleware'

import { AppContextProvider } from './AppContextProvider'
import { AppErrorBoundary } from './AppErrorBoundary'
import { AudiusQueryProvider } from './AudiusQueryProvider'
import { ThemeProvider } from './ThemeProvider'
import WebPlayer from './web-player/WebPlayer'

const { NOT_FOUND_PAGE, SIGN_IN_PAGE, SIGN_ON_ALIASES, SIGN_UP_PAGE } = route

// Lazy load pages for code splitting
const SignOnPage = lazy(() => import('pages/sign-on-page'))
const OAuthLoginPage = lazy(() => import('pages/oauth-login-page'))
const OAuthSignUpPage = lazy(() =>
  import('pages/oauth-login-page/OAuthSignUpPage').then((m) => ({
    default: m.OAuthSignUpPage
  }))
)

// Component to set up navigation ref for middleware (must be inside router context)
const NavigationSetup = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigateRef(navigate as any)
    return () => {
      setNavigateRef(null as any)
    }
  }, [navigate])

  return <>{children}</>
}

// Root layout component that wraps all routes with providers
const RootLayout = () => {
  return (
    <NavigationSetup>
      <RouterContextProvider>
        <HeaderContextProvider>
          <NavProvider>
            <ScrollProvider>
              <AppContextProvider>
                <AudiusQueryProvider>
                  <ThemeProvider>
                    <ToastContextProvider>
                      <MainContentContextProvider>
                        <SyncLocalStorageUserProvider
                          localStorage={localStorage}
                        >
                          <SomethingWrong />
                          <Suspense fallback={null}>
                            <Outlet />
                          </Suspense>
                        </SyncLocalStorageUserProvider>
                      </MainContentContextProvider>
                    </ToastContextProvider>
                  </ThemeProvider>
                </AudiusQueryProvider>
              </AppContextProvider>
            </ScrollProvider>
          </NavProvider>
        </HeaderContextProvider>
      </RouterContextProvider>
    </NavigationSetup>
  )
}

// Create routes configuration
export const createRoutes = (): RouteObject[] => {
  return [
    {
      element: <RootLayout />,
      children: [
        // Sign-on alias redirects
        ...SIGN_ON_ALIASES.map((alias) => ({
          path: alias,
          element: <Navigate to={SIGN_IN_PAGE} replace />
        })),
        // Sign in routes
        {
          path: `${SIGN_IN_PAGE}/*`,
          children: [
            {
              index: true,
              element: <SignOnPage />
            },
            {
              path: '*',
              element: <SignOnPage />
            }
          ]
        },
        // Sign up routes
        {
          path: `${SIGN_UP_PAGE}/*`,
          children: [
            {
              index: true,
              element: <SignOnPage />
            },
            {
              path: '*',
              element: <SignOnPage />
            }
          ]
        },
        // OAuth routes
        {
          path: '/oauth/auth/pay',
          element: <Navigate to={NOT_FOUND_PAGE} replace />
        },
        {
          path: '/oauth/pay',
          element: <Navigate to={NOT_FOUND_PAGE} replace />
        },
        {
          path: '/oauth/auth',
          element: <OAuthLoginPage />
        },
        {
          path: '/oauth/auth/signup/*',
          element: <OAuthSignUpPage />
        },
        {
          path: '/settings/export-private-key',
          element: <Navigate to={NOT_FOUND_PAGE} replace />
        },
        // Catch-all route for WebPlayer
        {
          path: '*',
          element: (
            <AppErrorBoundary>
              <WebPlayer />
            </AppErrorBoundary>
          )
        }
      ]
    }
  ]
}
