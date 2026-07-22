import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { RealtimeProvider } from "@/components/RealtimeProvider"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <TRPCProvider>
        <RealtimeProvider>
          <App />
        </RealtimeProvider>
      </TRPCProvider>
    </HashRouter>
  </StrictMode>,
)
