import * as React from "react"
import { observer } from "mobx-react-lite"
import { Screen } from "../screen/screen"
import { Container } from "../container/container"

export interface LayoutProps {
  children?: React.ReactNode,
  isScreenLoading?: boolean,
  isOverlayLoading?: boolean,
  isContentLoading?: boolean,
  header?: React.FunctionComponent,
  footer?: React.FunctionComponent,
  noScroll?: boolean
}

/**
 * Describe your component here
 */
export const Layout = observer(function Layout(props: LayoutProps) {
  return (
    <Screen 
      preset="fixed" 
      isLoading={props.isScreenLoading} 
      isOverlayLoading={props.isOverlayLoading}
    >
      {props.header(props)}
      <Container isLoading={props.isContentLoading} noScroll={props.noScroll}>
        {props.children}
      </Container>
      {props.footer(props)}
    </Screen>
  )
})
