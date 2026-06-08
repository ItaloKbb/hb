import { createContext, ReactNode, useContext, useRef } from 'react'

import { useStoreSnapshot } from './hooks/useStoreSnapshot'
import MainStore, { IState } from './mainStore'

const MainStoreContext = createContext<MainStore | null>(null)

export function MainStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<MainStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = new MainStore()
  }

  return (
    <MainStoreContext.Provider value={storeRef.current}>
      {children}
    </MainStoreContext.Provider>
  )
}

export function useMainStore(): MainStore {
  const store = useContext(MainStoreContext)
  if (!store) {
    throw new Error('useMainStore must be used within MainStoreProvider')
  }
  return store
}

export function useMainStoreState(): IState {
  return useStoreSnapshot(useMainStore())
}
