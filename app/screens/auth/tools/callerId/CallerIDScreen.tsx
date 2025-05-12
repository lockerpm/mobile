import { observer } from "mobx-react-lite"
import React from "react"
import { Screen, Header } from "app/components/cores"
import { useNavigation } from "@react-navigation/native"

// @ts-ignore
import { CallerContent } from "./CallerContent"

export const CallerIDScreen = observer(() => {
  const navigation = useNavigation() as any
  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={
        <Header leftIcon="arrow-left" titleTx={"caller_id.title"} onLeftPress={navigation.goBack} />
      }
    >
      <CallerContent />
    </Screen>
  )
})
