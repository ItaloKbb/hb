import * as React from 'react'

import StageStore from './store'

export const stageStoreContextTypes = {
  stageStore: React.PropTypes.instanceOf(StageStore).isRequired,
}

export const stageStoreChildContextTypes = stageStoreContextTypes

export function getStageStoreChildContext(store: StageStore) {
  return { stageStore: store }
}

export function withStageStore<P>(
  Component: React.StatelessComponent<P & { store: StageStore }>,
): React.ComponentClass<P> {
  return class WithStageStore extends React.Component<P, {}> {
    static contextTypes = stageStoreContextTypes

    render() {
      return (
        <Component
          {...this.props}
          store={(this.context as { stageStore: StageStore }).stageStore}
        />
      )
    }
  }
}
