import { createContext, ReactNode, useContext } from 'react'

import StageStore from './store'

const StageStoreContext = createContext<StageStore | null>(null)

export function StageStoreProvider({
  store,
  children,
}: {
  store: StageStore
  children: ReactNode
}) {
  return (
    <StageStoreContext.Provider value={store}>
      {children}
    </StageStoreContext.Provider>
  )
}

export function useStageStore(): StageStore {
  const store = useContext(StageStoreContext)
  if (!store) {
    throw new Error('useStageStore must be used within StageStoreProvider')
  }
  return store
}
