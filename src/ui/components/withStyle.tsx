import { css } from 'aphrodite'
import { ComponentType, FC, HTMLAttributes } from 'react'

type TypedComponentClass<Props> = (
  ComponentType<Props>
  | string
)

export type StyledComponentProps<Props> = (
  Props
  & HTMLAttributes<{}>
  & { className?: void, classes?: any }
)

function className<Props>(
  displayName: string,
  Component: TypedComponentClass<Props & { className?: string }>,
  ...baseClasses: any[]
): ComponentType<StyledComponentProps<Props>> {
  const C: any = Component

  const Wrapper: FC<StyledComponentProps<Props>> = (props) => {
    const classNames = css(baseClasses, ...(props.classes || []))
    return <C className={classNames} {...(props as any)} />
  }

  Wrapper.displayName = displayName

  return Wrapper
}

function classes<Props>(
  displayName: string,
  Component: TypedComponentClass<Props & { classes: any[] }>,
  ...baseClasses: any[]
): ComponentType<StyledComponentProps<Props>> {
  const C: any = Component

  const Wrapper: FC<StyledComponentProps<Props>> = (props) => {
    const mergedClasses = [...baseClasses, ...[props.classes || []]]
    return <C classes={mergedClasses} {...(props as any)} />
  }

  Wrapper.displayName = displayName

  return Wrapper
}

export default {
  className,
  classes,
}
