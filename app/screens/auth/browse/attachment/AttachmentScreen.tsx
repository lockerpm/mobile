import { useNavigation } from "@react-navigation/native"
import { Header, Screen } from "app/components/cores"
import React from "react"
import { AttachmentSelectIcon } from "./AttachmentSelectModal"

export const AttachmentScreen = () => {
  const navigation = useNavigation()

  // -------------- PARAMS ------------------

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleTx="file_attachment.title"
          rightIcon="plus"
          RightActionComponent={<AttachmentSelectIcon />}
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
    ></Screen>
  )
}
