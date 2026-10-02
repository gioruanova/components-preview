import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
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
import { CombinerPage } from './combiner/CombinerPage'
import { CategoryPage, NotFound, WidgetPage } from './app/pages'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delayDuration={300}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="combiner" element={<CombinerPage />} />
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
