import { Header, Screen, Text } from "app/components/cores"
import React, { FC, useCallback, useState } from "react"
import { AttachmentSelectIcon } from "./AttachmentSelectModal"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import {
  FlatList,
  Image,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Attachment } from "./item/Attachment"
import { AttachmentType } from "./usePickAttachment"
import { AttachmentView, CipherView } from "core/models/view"
import { useCipherData } from "app/services/hook"
import { AppStackScreenProps } from "app/navigators/navigators.types"
import { useAppLocale, useTheme } from "app/services/context"

const EMPTY_IMAGE = require("assets/images/empty_attachment.png")

export const AttachmentScreen: FC<AppStackScreenProps<"attachment">> = observer(
  ({ navigation, route }) => {
    const { cipherStore, user } = useStores()
    const { updateCipher } = useCipherData()
    const { colors } = useTheme()
    const { translate } = useAppLocale()

    const isShared = route.params?.isShared ?? false
    const isFree = user.isFreePlan

    const selectedCipher = (cipherStore.selectedCipher as CipherView) ?? null

    // -------------- PARAMS ------------------

    const [attachments, setAttachments] = useState<AttachmentType[]>(
      cipherStore.selectedCipher?.attachments || [],
    )

    // -------------- METHODS ------------------
    const goPayment = useCallback(() => {
      navigation.navigate("payment")
    }, [navigation])

    const updateCipherAttachment = async (attachments: AttachmentType[]) => {
      if (!selectedCipher) return

      const payload: CipherView = { ...cipherStore.selectedCipher }
      const attachmentsView: AttachmentView[] = attachments.map((a) => {
        const attachment = new AttachmentView()
        attachment.id = a.id
        attachment.fileName = a.fileName
        attachment.size = a.size.toString()
        attachment.url = a.url
        attachment.key = a.key
        return attachment
      })
      payload.attachments = attachmentsView

      await updateCipher(payload.id, payload, 0, payload.collectionIds, true)
    }

    /**
     * User select local attachment to upload
     */
    const addLocalAttachment = useCallback((newFile: AttachmentType) => {
      setAttachments((prev) => [newFile, ...prev])
    }, [])

    /**
     * Call back when user delete or upload successfully attachment
     */
    const updateAttachments = useCallback(
      async (attachment: AttachmentType, isDelete: boolean) => {
        const newAttachments = attachments.filter((a) => a.id !== attachment.id)
        if (!isDelete) {
          newAttachments.unshift(attachment)
        }
        setAttachments(newAttachments)
        await updateCipherAttachment(newAttachments)
      },
      [attachments],
    )

    // -------------- RENDER ------------------
    const RightActionComponent = useCallback(() => {
      return !isShared ? (
        <AttachmentSelectIcon isFree={isFree} addAttachment={addLocalAttachment} />
      ) : undefined
    }, [isShared, isFree])

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
            RightActionComponent={<RightActionComponent />}
          />
        }
        contentContainerStyle={container}
      >
        {isFree && !isShared && (
          <View style={upgradeNote(colors)}>
            <Text text={translate("file_attachment.upgrade")} />

            <TouchableOpacity onPress={goPayment}>
              <Text color={colors.primary} style={upgrade} tx="password_history.free.upgrade" />
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={attachments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={listContent}
          renderItem={({ item }) => (
            <Attachment
              isFree={isFree}
              item={item}
              updateAttachments={updateAttachments}
              isShared={isShared}
            />
          )}
          ListEmptyComponent={<EmptyList />}
          ItemSeparatorComponent={ItemSeparatorComponent}
        />
      </Screen>
    )
  },
)

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

const upgrade: TextStyle = {
  alignSelf: "flex-end",
  flexGrow: 1,
  marginTop: 16,
}

const upgradeNote: (colors: any) => ViewStyle = (colors) => ({
  borderRadius: 8,
  marginHorizontal: 16,
  borderColor: colors.border,
  borderWidth: 1,
  backgroundColor: colors.block,
  padding: 16,
  marginTop: 16,
})
