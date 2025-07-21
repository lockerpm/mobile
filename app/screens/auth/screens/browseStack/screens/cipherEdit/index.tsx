/* eslint-disable @typescript-eslint/no-unused-vars */
import { BrowseScreenProps } from "app/navigators"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useMemo, useState } from "react"
import { View, ViewStyle } from "react-native"
import { useStores } from "app/models"
import { CardView, IdentityView, LoginView, SecureNoteView } from "core/models/view"
import { CipherType } from "core/enums"
import { CipherAppView } from "app/static/types"
import { CipherRepromptType } from "core/enums/cipherRepromptType"
import { PasswordEdit } from "./password/PasswordEdit"
import { find, set } from "lodash"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"
import { CardEdit } from "./cards/CardEdit"
import { CryptoWalletEdit } from "./cryptoAsset/CryptoWalletEdit"
import { IdentityEdit } from "./identities/IdentityEdit"
import { NoteEdit } from "./NoteEdit"
import { VAULT_LOGO } from "@/static/vault"
import { AuthenticatorEdit } from "./AuthenticatorEdit"
import { AppEventType, EventBus } from "@/utils/eventBus"

const defaultImage = (type: CipherType) => {
  switch (type) {
    case CipherType.Login:
      return VAULT_LOGO.passwords
    case CipherType.Card:
      return VAULT_LOGO.cards
    case CipherType.CryptoWallet:
      return VAULT_LOGO.cryptoWallets
    case CipherType.Identity:
      return VAULT_LOGO.identities
    case CipherType.SecureNote:
      return VAULT_LOGO.notes
    default:
      return VAULT_LOGO.passwords
  }
}

const newCipher = (type: CipherType): CipherAppView => ({
  id: "",
  organizationId: null,
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
  imgLogo: defaultImage(type), // Placeholder for image logo
})

export const CipherEditScreen: FC<BrowseScreenProps<"cipherEdit">> = observer(
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
    const [folderId, setFolderId] = useState(initFolderId || item.folderId || "")
    const [collectionIds, setCollectionIds] = useState(
      initCollectionIds || item.collectionIds || []
    )
    const [organizationId, setOrganizationId] = useState(
      mode === "clone" ? null : item.organizationId
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

    // -------------- EFFECT --------------

    useEffect(() => {
      const listener1 = EventBus.createListener(
        AppEventType.CIPHER_EDIT_FOLDER_SELECT,
        ({ id, isCollection }: { id: string; isCollection: boolean }) => {
          if (isCollection) {
            setCollectionIds([id])
            setFolderId("") // Clear folderId if a collection is selected
          } else {
            setFolderId(id)
            setCollectionIds([])
            setOrganizationId(null)
          }
        }
      )

      return () => {
        EventBus.removeListener(listener1)
      }
    }, [])

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

        {item.type === CipherType.TOTP && (
          <AuthenticatorEdit item={item} mode={mode} navigation={navigation} />
        )}
      </View>
    )
  }
)

const $container: ViewStyle = {
  flex: 1,
}
