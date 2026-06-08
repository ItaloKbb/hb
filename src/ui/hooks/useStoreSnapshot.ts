import { useCallback, useSyncExternalStore } from 'react'

export interface SubscribableStore<S> {
  subscribe(listener: () => void): () => void
  state: S
}

export function useStoreSnapshot<S>(store: SubscribableStore<S>): S {
  const subscribe = useCallback(
    (onStoreChange: () => void) => store.subscribe(onStoreChange),
    [store],
  )
  const getSnapshot = useCallback(() => store.state, [store])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
