import { FC, useCallback, useState } from "react"
import {
  FlatList,
  Image,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { observer } from "mobx-react-lite"

import { Header, PressableScale, Screen, Text } from "app/components/cores"
import { useStores } from "app/models"
import { BrowseScreenProps } from "app/navigators"
import { useCipherData } from "app/services/hook"
import { AttachmentView, CipherView } from "core/models/view"

import { useAppTheme } from "@/utils/useAppTheme"

import { AttachmentSelectIcon } from "./AttachmentSelectModal"
import { Attachment } from "./item/Attachment"
import { FilePreview } from "./item/FilePreview"
import { AttachmentType } from "./usePickAttachment"

const EMPTY_IMAGE = require("assets/images/empty_attachment.png")

export const AttachmentScreen: FC<BrowseScreenProps<"attachment">> = observer(
  ({
    navigation,
    route: {
      params: { isShared = false, cipher },
    },
  }) => {
    const { user } = useStores()
    const { updateCipher } = useCipherData()
    const {
      theme: { colors },
    } = useAppTheme()

    const isFree = user.isFreePlan

    // -------------- PARAMS ------------------

    const [attachments, setAttachments] = useState<AttachmentType[]>(
      cipher.attachments?.map((e) => ({
        id: e.id,
        fileName: e.fileName,
        size: parseInt(e.size, 10),
        url: e.url,
        key: e.key || "",
      })) || []
    )
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [localFile, setLocalFile] = useState<AttachmentType | null>(null)

    // -------------- METHODS ------------------
    const goPayment = useCallback(() => {
      navigation.navigate("menuStack", {
        screen: "payment",
      })
    }, [navigation])

    const updateCipherAttachment = async (attachments: AttachmentType[]) => {
      // @ts-ignore
      const payload: CipherView = { ...cipher }
      const attachmentsView: AttachmentView[] = attachments?.map((a) => {
        const attachment = new AttachmentView()
        attachment.id = a.id
        attachment.fileName = a.fileName
        attachment.size = a.size.toString()
        attachment.url = a.url
        attachment.key = a.key ?? ""
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
    const updateAttachments = async (attachment: AttachmentType, isDelete: boolean) => {
      const newAttachments = attachments.filter((a) => a.id !== attachment.id)
      if (!isDelete) {
        newAttachments.unshift(attachment)
      }
      setAttachments(newAttachments)
      await updateCipherAttachment(newAttachments)
    }

    // -------------- RENDER ------------------
    const RightActionComponent = useCallback(() => {
      return !isShared ? (
        <AttachmentSelectIcon
          setIsAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          isFree={isFree}
          setLocalFile={setLocalFile}
        />
      ) : undefined
    }, [isShared, isAddOpen, isFree])

    const EmptyList = useCallback(
      () => (
        <PressableScale disabled={isShared} onPress={() => setIsAddOpen(true)}>
          <Image source={EMPTY_IMAGE} style={imageStyle} resizeMode="contain" />
        </PressableScale>
      ),
      [isShared]
    )

    const ItemSeparatorComponent = useCallback(() => <View style={separator} />, [])

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="file_attachment:title"
            RightActionComponent={<RightActionComponent />}
          />
        }
        contentContainerStyle={container}
      >
        {isFree && !isShared && (
          <View style={upgradeNote(colors)}>
            <Text tx={"file_attachment:upgrade"} />

            <TouchableOpacity onPress={goPayment}>
              <Text color={colors.primary} style={upgrade} tx="password_history:free.upgrade" />
            </TouchableOpacity>
          </View>
        )}

        {localFile && (
          <FilePreview item={localFile} setItem={setLocalFile} addAttachment={addLocalAttachment} />
        )}
        <FlatList
          data={attachments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={listContent}
          renderItem={({ item }) => (
            <Attachment
              cipherId={cipher.id}
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
  }
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
