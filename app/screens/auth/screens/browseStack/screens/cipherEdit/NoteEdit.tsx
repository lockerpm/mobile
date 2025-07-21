import { useCallback, useState } from "react"
import { observer } from "mobx-react-lite"
import { Image, View, StyleSheet, ViewStyle } from "react-native"
import { CipherView, FieldView } from "core/models/view"
import { useCipherData, useFolder } from "app/services/hook"
import { Header, Screen, TextInput, Text } from "app/components/cores"
import { Textarea } from "app/components/utils"
import { CollectionView } from "core/models/view/collectionView"
import { BrowseScreenProps } from "app/navigators"
import { CipherAppView, CipherEditHelperModal, CipherEditMode } from "app/static/types"
import { FolderView } from "core/models/view/folderView"
import { CipherOthersInfo, CustomFieldsEdit } from "app/components/ciphers"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { SecureNoteType } from "core/enums"

type Props = {
  item: CipherAppView
  mode: CipherEditMode
  navigation: BrowseScreenProps<"cipherEdit">["navigation"]

  // other common info
  folder?: FolderView
  collection?: CollectionView
  collectionIds: string[]
  organizationId: string | null

  isOwner: boolean
}

export const NoteEdit = observer(
  ({
    navigation,
    mode,
    item,
    collection,
    folder,
    organizationId,
    collectionIds,
    isOwner,
  }: Props) => {
    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const { shareFolderAddItem } = useFolder()
    const { createCipher, updateCipher } = useCipherData()

    // ----------------- COMPUTED ------------------

    // ----------------- PARAMS ------------------
    const [isLoading, setIsLoading] = useState(false)
    // Forms
    const [name, setName] = useState(item.name)
    const [note, setNote] = useState(item.notes)
    const [fields, setFields] = useState<FieldView[]>(item.fields ?? [])

    // ----------------- METHODS ------------------

    const navigatePlanStorageLimit = useCallback(() => {
      navigation.navigate("cipherEditHelperModal", {
        mode: CipherEditHelperModal.PLAN_STORAGE_LIMIT,
      })
    }, [navigation])

    const handleSave = async () => {
      setIsLoading(true)
      // @ts-ignore
      const payload: CipherView = { ...item }

      payload.secureNote.type = SecureNoteType.Generic
      payload.fields = fields
      payload.name = name
      payload.notes = note
      payload.folderId = folder?.id || ""
      payload.organizationId = organizationId as string

      let res = { kind: "unknown" }
      if (["add", "clone"].includes(mode)) {
        res = await createCipher(payload, 0, collectionIds)
      } else {
        res = await updateCipher(payload.id, payload, 0, collectionIds)
      }
      if (res.kind === "ok") {
        if (isOwner && collection) {
          await shareFolderAddItem(collection, payload)
        }
        setIsLoading(false)
        navigation.goBack()
      } else {
        setIsLoading(false)

        // reach limit plan stogare
        // @ts-ignore
        if (res?.data?.code === "5002") {
          navigatePlanStorageLimit()
        }
      }
    }

    // Render
    return (
      <Screen
        preset="auto"
        header={
          <Header
            titleTx={mode === "add" ? "common:add" : "common:edit"}
            leftTx={"common:cancel"}
            onLeftPress={navigation.goBack}
            rightTx="common:save"
            rightLoading={isLoading}
            rightDisabled={isLoading || !name.trim()}
            onRightPress={handleSave}
            rightIconColor={colors.primary}
          />
        }
        ScrollViewProps={{
          contentContainerStyle: styles.scrollContainer,
        }}
      >
        <View style={styles.header}>
          <Image resizeMode="contain" source={item.imgLogo} style={styles.image} />
          <View style={styles.flex}>
            <TextInput
              animated
              isRequired
              labelTx={"common:item_name"}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={themed($label)}>
          <Text preset="label" size="sm" tx={"common:details"} />
        </View>

        <View style={styles.notes}>
          <Textarea labelTx={"common:notes"} value={note} onChangeText={setNote} />
        </View>

        <CustomFieldsEdit fields={fields} setFields={setFields} />

        <CipherOthersInfo
          hasNote={false}
          isOwner={isOwner}
          folder={folder}
          collection={collection}
          isDeleted={item.isDeleted}
        />
      </Screen>
    )
  }
)

const $label: ThemedStyle<ViewStyle> = ({ colors }) => ({
  padding: 16,
  paddingVertical: 8,
  backgroundColor: colors.block,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 0,
  },
  image: {
    height: 50,
    marginRight: 10,
    marginTop: 26,
    width: 50,
  },
  notes: {
    padding: 16,
    paddingBottom: 32,
  },
  scrollContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
})
