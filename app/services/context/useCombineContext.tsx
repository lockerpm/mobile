import React from 'react'

interface Props {
  components: Array<React.JSXElementConstructor<React.PropsWithChildren<any>>>
  children: React.ReactNode
  childProps?: {
    [key: string]: any
  }
}

export default function CombineContext(props: Props) {
  const { components = [], children, childProps = {} } = props

  return (
    <>
      {components.reduceRight((acc, Comp) => {
        return <Comp {...childProps}>{acc}</Comp>
      }, children)}
    </>
  )
}
