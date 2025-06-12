/* eslint-disable @typescript-eslint/no-unused-vars */
import { BrowseStackScreenProps } from "app/navigators"
import { observer } from "mobx-react-lite"
import React, { FC, useMemo, useState } from "react"
import { View, ViewStyle } from "react-native"
import { useStores } from "app/models"
import { CardView, IdentityView, LoginView, SecureNoteView } from "core/models/view"
import { CipherType } from "core/enums"
import { CipherAppView } from "app/static/types"
import { CipherRepromptType } from "core/enums/cipherRepromptType"
import { PasswordEdit } from "./PasswordEdit"
import { find } from "lodash"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"
import { CardEdit } from "./cards/CardEdit"
import { CryptoWalletEdit } from "./cryptoAsset/CryptoWalletEdit"
import { IdentityEdit } from "./identities/IdentityEdit"
import { NoteEdit } from "./NoteEdit"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

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
    const [folderId, setFolderId] = useState(item.folderId || initFolderId || "")
    const [collectionIds, setCollectionIds] = useState(
      item.collectionIds || initCollectionIds || [],
    )
    const [organizationId, setOrganizationId] = useState(
      mode === "clone" ? "" : item.organizationId,
    )

    // -------------------------- COMPUTED --------------------------

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
      item,
      mode,
      navigation,
      folderId,
      folder,
      collectionIds,
      organizationId,
      collection,
      isOwner,
    }
    return (
      <View style={$container}>
        {item.type === CipherType.Login && (
          <PasswordEdit
            initialUrl={initialUrl}
            androidAutofillSavedData={androidAutofillSavedData}
            {...otherCommonInfo}
          />
        )}
        {item.type === CipherType.Card && <CardEdit {...otherCommonInfo} />}
        {item.type === CipherType.CryptoWallet && <CryptoWalletEdit {...otherCommonInfo} />}
        {item.type === CipherType.Identity && <IdentityEdit {...otherCommonInfo} />}
        {item.type === CipherType.SecureNote && <NoteEdit {...otherCommonInfo} />}
      </View>
    )
  },
)

const $container: ViewStyle = {
  flex: 1,
}
const $content: ViewStyle = {
  paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
}
