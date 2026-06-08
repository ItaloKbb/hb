import { createRoot } from 'react-dom/client'

import App from './ui/app'

const container = document.getElementById('app')!
createRoot(container).render(<App />)
