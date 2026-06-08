declare module 'animejs' {
  interface AnimeInstance {
    finished: Promise<void>
  }

  interface AnimeParams {
    targets?: Element | Element[] | object | object[]
    [key: string]: unknown
  }

  function anime(params: AnimeParams): AnimeInstance
  export default anime
}
