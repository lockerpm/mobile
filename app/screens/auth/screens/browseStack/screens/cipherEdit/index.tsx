/* eslint-disable @typescript-eslint/no-unused-vars */
import { BrowseStackScreenProps } from "app/navigators"
import { observer } from "mobx-react-lite"
import React, { FC, useMemo, useState } from "react"
import { View, ViewStyle } from "react-native"
import { CipherOthersInfo, CustomFieldsEdit } from "app/components/newCiphers"
import { useStores } from "app/models"
import { CardView, FieldView, IdentityView, LoginView, SecureNoteView } from "core/models/view"
import { CipherType } from "core/enums"
import { CipherAppView } from "app/static/types"
import { CipherRepromptType } from "core/enums/cipherRepromptType"
import { PasswordEdit } from "./PasswordEdit"
import { find } from "lodash"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"

const newCipher = (type: CipherType): CipherAppView => ({
  id: "",
  organizationId: "",
  folderId: "",
  name: "",
  notes: "",
  type,
  favorite: false,
  organizationUseTotp: false,
  edit: false,
  viewPassword: true,
  localData: null,
  login: new LoginView(),
  identity: new IdentityView(),
  card: new CardView(),
  secureNote: new SecureNoteView(),
  attachments: [],
  fields: [],
  passwordHistory: [],
  collectionIds: [],
  revisionDate: null,
  deletedDate: new Date(),
  reprompt: CipherRepromptType.None,
  notSync: false,
  isDeleted: false,
  imgLogo: { uri: "" }, // Placeholder for image logo
})

export const CipherEditScreen: FC<BrowseStackScreenProps<"cipherEdit">> = observer(
  ({
    navigation,
    route: {
      params: {
        mode,
        cipherType,
        cipher,
        initCollectionIds,
        initFolderId,
        initialUrl,
        androidAutofillSavedData,
      },
    },
  }) => {
    const { cipherStore, collectionStore, folderStore } = useStores()

    const item: CipherAppView = cipher ?? newCipher(cipherType)

    // -------------- PARAMS --------------
    const [note, setNote] = useState("") // custom note for the cipher, not use in CipherType SecureNote

    const [folderId, setFolderId] = useState(item.folderId || initFolderId || "")
    const [collectionIds, setCollectionIds] = useState(
      item.collectionIds || initCollectionIds || [],
    )
    const [organizationId, setOrganizationId] = useState(
      mode === "clone" ? "" : item.organizationId,
    )
    const [fields, setFields] = useState<FieldView[]>(item.fields)

    // -------------- COMPUTED --------------
    const collectionId = collectionIds.length > 0 ? collectionIds[0] : ""

    const folder: FolderView | undefined = useMemo(() => {
      if (!folderId) {
        return undefined
      }
      return find(folderStore.folders, (e) => e.id === folderId)
    }, [folderId])

    const collection: CollectionView | undefined = useMemo(() => {
      if (!collectionId) {
        return undefined
      }
      return find(collectionStore.collections, (e) => e.id === collectionId)
    }, [collectionId])

    const isOwner = useMemo(() => {
      if (!organizationId) {
        return true
      }
      const org = cipherStore.myShares.find((s) => s.organization_id === organizationId)
      return !!org
    }, [organizationId])

    // -------------- METHOD --------------

    const otherCommonInfo = {
      note,
      folderId,
      fields,
      collectionIds,
      organizationId,
      collection,
    }
    return (
      <View style={$container}>
        <PasswordEdit
          item={item}
          mode={mode}
          navigation={navigation}
          initialUrl={initialUrl}
          androidAutofillSavedData={androidAutofillSavedData}
          {...otherCommonInfo}
        />

        <CustomFieldsEdit fields={fields} setFields={setFields} />

        <CipherOthersInfo
          isOwner={isOwner}
          hasNote={cipherType !== CipherType.SecureNote}
          note={note}
          onChangeNote={setNote}
          folder={folder}
          collection={collection}
          isDeleted={item.isDeleted}
        />
      </View>
    )
  },
)

const $container: ViewStyle = {
  flex: 1,
}
