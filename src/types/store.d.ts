declare module 'store' {
  interface StoreJsAPI {
    get(key: string, alt?: unknown): unknown
    set(key: string, value: unknown): unknown
    remove(key: string): void
    clearAll(): void
  }

  const store: StoreJsAPI
  export = store
}
