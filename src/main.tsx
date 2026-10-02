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
import { CategoryPage, HomeRedirect, NotFound, WidgetPage } from './app/pages'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delayDuration={300}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomeRedirect />} />
            <Route path=":category" element={<CategoryPage />} />
            <Route path=":category/:component" element={<WidgetPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors closeButton={false} duration={1800} />
    </TooltipProvider>
  </StrictMode>,
)
