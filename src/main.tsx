import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import '@fontsource/outfit/900.css'
import './index.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Layout } from './app/Layout'
import { HomePage } from './app/HomePage'
import { CategoryPage, NotFound, WidgetPage } from './app/pages'

// After a new deploy, an open tab may request a lazy chunk that no longer exists → reload once to get the new build
window.addEventListener('vite:preloadError', (event) => {
  if (sessionStorage.getItem('chunk-reload')) return
  sessionStorage.setItem('chunk-reload', '1')
  event.preventDefault()
  window.location.reload()
})
window.addEventListener('load', () => setTimeout(() => sessionStorage.removeItem('chunk-reload'), 10_000))

// Heavy, rarely-first routes are code-split (dnd-kit etc. only load when the Layout builder opens)
const CombinerPage = lazy(() => import('./combiner/CombinerPage').then((m) => ({ default: m.CombinerPage })))
// Hidden presentation (not in the nav): /benchmark
const BenchmarkPage = lazy(() => import('./app/BenchmarkPage').then((m) => ({ default: m.BenchmarkPage })))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delayDuration={300}>
      <BrowserRouter>
        <Routes>
          {/* full screen, outside the app layout */}
          <Route
            path="benchmark"
            element={
              <Suspense fallback={null}>
                <BenchmarkPage />
              </Suspense>
            }
          />
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="layout-builder" element={<CombinerPage />} />
            {/* old URL */}
            <Route path="combiner" element={<Navigate to="/layout-builder" replace />} />
            <Route path=":category" element={<CategoryPage />} />
            <Route path=":category/:component" element={<WidgetPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      {/* offset keeps toasts above the floating idea button */}
      <Toaster position="bottom-right" offset={{ bottom: 96, right: 20 }} mobileOffset={{ bottom: 88 }} richColors closeButton={false} duration={2200} />
    </TooltipProvider>
  </StrictMode>,
)
