import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Image, View, StyleSheet } from "react-native"
import find from "lodash/find"
import { useStores } from "app/models"
import { CipherView, FieldView } from "core/models/view"
import { useAppLocale, useTheme } from "app/services/context"
import { useCipherData, useCipherHelper, useFolder } from "app/services/hook"
import { Button, Header, Screen, TextInput, Text } from "app/components/cores"
import { Textarea } from "app/components/utils"
import { CipherType } from "core/enums"
import { CollectionView } from "core/models/view/collectionView"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { BrowseStackScreenProps } from "app/navigators"
import { CipherAppView, CipherEditMode } from "app/static/types"
import { FolderView } from "core/models/view/folderView"
import { CipherOthersInfo, CustomFieldsEdit } from "app/components/newCiphers"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

type Props = {
  item: CipherAppView
  mode: CipherEditMode
  navigation: BrowseStackScreenProps<"cipherEdit">["navigation"]

  // other common info
  folder?: FolderView
  collection?: CollectionView
  collectionIds: string[]
  organizationId: string

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
    const { collectionStore } = useStores()
    const { translate } = useAppLocale()
    const { colors } = useTheme()

    const { shareFolderAddItem } = useFolder()
    const { newCipher } = useCipherHelper()
    const { createCipher, updateCipher } = useCipherData()

    // ----------------- COMPUTED ------------------

    const selectedCipher: CipherAppView = item

    // ----------------- PARAMS ------------------
    const [isLoading, setIsLoading] = useState(false)
    // Forms
    const [name, setName] = useState(mode !== "add" ? selectedCipher.name : "")
    const [note, setNote] = useState(mode !== "add" ? selectedCipher.notes : "")
    // other
    const [fields, setFields] = useState<FieldView[]>(item.fields)
    // ----------------- METHODS ------------------
    const handleSave = async () => {
      setIsLoading(true)
      let payload: CipherView
      if (mode === "add") {
        payload = newCipher(CipherType.SecureNote)
      } else {
        // @ts-ignore
        payload = { ...selectedCipher }
      }

      payload.fields = fields
      payload.name = name
      payload.notes = note
      payload.folderId = folder?.id || ""
      payload.organizationId = organizationId

      let res = { kind: "unknown" }
      if (["add", "clone"].includes(mode)) {
        res = await createCipher(payload, 0, collectionIds)
      } else {
        res = await updateCipher(payload.id, payload, 0, collectionIds)
      }

      if (res.kind === "ok") {
        if (isOwner) {
          if (collection) {
            const collectionView =
              find(collectionStore.collections, (e) => e.id === collection) || {}
            await shareFolderAddItem(collectionView, payload)
          }
        }
        setIsLoading(false)
        navigation.goBack()
      } else {
        setIsLoading(false)

        // reach limit plan stogare
        // @ts-ignore
        if (res?.data?.code === "5002") {
          // setIsOpenModal(true)
        }
      }
    }

    // Render
    return (
      <Screen
        preset="auto"
        header={
          <Header
            title={
              mode === "add"
                ? `${translate("common.add")} ${translate("common.note")}`
                : translate("common.edit")
            }
            leftText={translate("common.cancel")}
            onLeftPress={() => navigation.goBack()}
            RightActionComponent={
              <Button
                preset="teriatary"
                loading={isLoading}
                disabled={isLoading || !name.trim()}
                text={translate("common.save")}
                onPress={handleSave}
              />
            }
          />
        }
        ScrollViewProps={{
          contentContainerStyle: styles.scrollContainer,
        }}
      >
        <View style={{ padding: 16, paddingTop: 0 }}>
          <View style={{ flexDirection: "row" }}>
            <Image
              resizeMode="contain"
              source={BROWSE_ITEMS.note.icon}
              style={{
                height: 50,
                width: 50,
                marginRight: 10,
                marginTop: 25,
              }}
            />
            <View style={{ flex: 1 }}>
              <TextInput
                animated
                isRequired
                label={translate("common.item_name")}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        </View>

        <View style={{ padding: 16, backgroundColor: colors.block }}>
          <Text preset="label" size="base" text={translate("common.details").toUpperCase()} />
        </View>

        <View
          style={{
            padding: 16,
            paddingBottom: 32,
          }}
        >
          <Textarea label={translate("common.notes")} value={note} onChangeText={setNote} />
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
  },
)

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
})
