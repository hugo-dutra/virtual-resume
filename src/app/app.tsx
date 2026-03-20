import { AppRouter } from './router/app-router'
import { AppProviders } from './providers/app-providers'

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}

export default App
