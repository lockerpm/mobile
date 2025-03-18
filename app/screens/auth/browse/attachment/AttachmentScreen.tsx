import { useNavigation } from "@react-navigation/native"
import { Header, Screen } from "app/components/cores"
import React, { useCallback, useState } from "react"
import { AttachmentSelectIcon } from "./AttachmentSelectModal"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { AttachmentType } from "./usePickAttachment"
import { FlatList, Image, ImageStyle, View, ViewStyle } from "react-native"
import { Attachment } from "./item/Attachment"

const EMPTY_IMAGE = require("assets/images/empty_attachment.png")

export const AttachmentScreen = observer(() => {
  const navigation = useNavigation()
  const { cipherStore } = useStores()

  console.log(cipherStore.selectedCipher)
  // -------------- PARAMS ------------------

  const [files, setFiles] = useState<AttachmentType[]>([])

  // -------------- METHODS ------------------

  const addAttachment = useCallback((newFile: AttachmentType) => {
    setFiles((prev) => [newFile, ...prev])
  }, [])

  const RightActionComponent = useCallback(() => {
    return <AttachmentSelectIcon addAttachment={addAttachment} />
  }, [])

  // -------------- RENDER ------------------

  const EmptyList = useCallback(
    () => <Image source={EMPTY_IMAGE} style={imageStyle} resizeMode="contain" />,
    [],
  )

  const ItemSeparatorComponent = useCallback(() => <View style={separator} />, [])

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleTx="file_attachment.title"
          rightIcon="plus"
          RightActionComponent={<RightActionComponent />}
        />
      }
      contentContainerStyle={container}
    >
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        contentContainerStyle={listContent}
        renderItem={({ item }) => <Attachment item={item} />}
        ListEmptyComponent={<EmptyList />}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    </Screen>
  )
})

const container: ViewStyle = {
  flex: 1,
}

const separator: ViewStyle = {
  height: 16,
}
const listContent: ViewStyle = {
  padding: 16,
}

const imageStyle: ImageStyle = {
  width: 200,
  height: 250,
  alignSelf: "center",
}
