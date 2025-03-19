import { useNavigation } from "@react-navigation/native"
import { Header, Screen } from "app/components/cores"
import React, { useCallback, useEffect, useState } from "react"
import { AttachmentSelectIcon } from "./AttachmentSelectModal"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { FlatList, Image, ImageStyle, View, ViewStyle } from "react-native"
import { Attachment } from "./item/Attachment"
import { AttachmentType } from "./usePickAttachment"
import { SymmetricCryptoKey } from "core/models/domain"

const EMPTY_IMAGE = require("assets/images/empty_attachment.png")

const test: AttachmentType = {
  id: "1742358762669",
  fileName: "8ADADE66-65F2-476D-AAEE-EFBEFE81C53F.png",
  size: 1001,
  url: "attachments/14da34aaae7412be6967ce97061b61f4/5f8918b1-60bb-4a58-94c7-841e55b18565/2561750864821100586",
  key: {
    key: {},
    encType: 0,
    encKey: {},
    macKey: null,
    keyB64: "98CAkwpg4Vp1sTbsGt1Ac/yladqdX3L2ANtj68Sj6JE=",
    encKeyB64: "98CAkwpg4Vp1sTbsGt1Ac/yladqdX3L2ANtj68Sj6JE=",
  } as SymmetricCryptoKey,
}

export const AttachmentScreen = observer(() => {
  const navigation = useNavigation()
  const { cipherStore } = useStores()

  console.tron.log("selected cipher id", cipherStore.selectedCipher?.id)
  // -------------- PARAMS ------------------

  const [attachments, setAttachments] = useState<AttachmentType[]>([])

  // -------------- METHODS ------------------

  const addAttachment = useCallback((newFile: AttachmentType) => {
    setAttachments((prev) => [newFile, ...prev])
  }, [])

  // -------------- RENDER ------------------
  const RightActionComponent = useCallback(() => {
    return <AttachmentSelectIcon addAttachment={addAttachment} />
  }, [])

  const EmptyList = useCallback(
    () => <Image source={EMPTY_IMAGE} style={imageStyle} resizeMode="contain" />,
    [],
  )

  const ItemSeparatorComponent = useCallback(() => <View style={separator} />, [])

  useEffect(() => {
    setAttachments([test])
  }, [])

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
        data={attachments}
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
