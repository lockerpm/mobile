import React, { FC, useEffect, useState } from "react"
import { ImageSourcePropType } from "react-native"
import { Screen, TabHeader } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { useTool } from "app/services/hook"
import { SharingStatus } from "app/static/types"
import { CipherType } from "core/enums"
import { TabsScreenProps } from "app/navigators"
import { TxKeyPath } from "app/i18n"
import { BrowserItem } from "./BrowserItem"
import { MenuItemContainer } from "app/components/utils"

type BrowseData = {
  notiCount?: number
  total: number
  label: TxKeyPath
  onPress: () => void
  image: ImageSourcePropType
}

type BrowseRoute =
  | "folder"
  | "password"
  | "note"
  | "card"
  | "cryptoWallet"
  | "identity"
  | "shares"
  | "trash"

const BROWSE_ITEMS: Record<BrowseRoute, ImageSourcePropType> = {
  folder: require("assets/images/icons/vault/folder.png"),
  password: require("assets/images/icons/vault/password.png"),
  note: require("assets/images/icons/vault/note.png"),
  card: require("assets/images/icons/vault/card.png"),
  cryptoWallet: require("assets/images/icons/vault/crypto-wallet.png"),
  identity: require("assets/images/icons/vault/info.png"),
  shares: require("assets/images/icons/vault/shared.png"),
  trash: require("assets/images/icons/vault/trash.png"),
}

export const BrowseListScreen: FC<TabsScreenProps<"browseTab">> = observer(({ navigation }) => {
  const { colors } = useTheme()
  const { cipherStore, folderStore, collectionStore } = useStores()
  const { getCipherCount } = useTool()

  const [data, setData] = useState<BrowseData[]>([])

  const shareNotiCount =
    cipherStore.sharingInvitationsIgnoreAccept.length +
    cipherStore.myShares.reduce((total, s) => {
      return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
    }, 0)

  const mount = async () => {
    const temp = Object.keys(BROWSE_ITEMS) as BrowseRoute[]
    const _data = await Promise.all(
      temp.map(async (key) => {
        let total = 0
        switch (key) {
          case "folder":
            total = folderStore.folders.length + collectionStore.collections.length
            return {
              label: "common.folders",
              total,
              image: BROWSE_ITEMS.folder,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "folderList",
                })
              },
            }
          case "password":
            total = (await getCipherCount([CipherType.Login])) + 1 // 1 is master password
            return {
              label: "common.passwords",
              total,
              image: BROWSE_ITEMS.password,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    cipherTypes: [CipherType.Login, CipherType.MasterPassword],
                    headerTx: "common.passwords",
                  },
                })
              },
            }
          case "note":
            total = await getCipherCount([CipherType.SecureNote])
            return {
              label: "common.note",
              total,
              image: BROWSE_ITEMS.note,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    cipherTypes: [CipherType.SecureNote],
                    headerTx: "common.note",
                  },
                })
              },
            }
          case "card":
            total = await getCipherCount([CipherType.Card])
            return {
              label: "common.card",
              total,
              image: BROWSE_ITEMS.card,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    cipherTypes: [CipherType.Card],
                    headerTx: "common.card",
                  },
                })
              },
            }
          case "cryptoWallet":
            total = await getCipherCount([CipherType.CryptoWallet])
            return {
              label: "common.crypto_wallet",
              total,
              image: BROWSE_ITEMS.cryptoWallet,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    cipherTypes: [CipherType.CryptoWallet],
                    headerTx: "common.crypto_wallet",
                  },
                })
              },
            }
          case "identity":
            total = await getCipherCount([CipherType.Identity])
            return {
              label: "common.identity",
              total,
              image: BROWSE_ITEMS.identity,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    cipherTypes: [CipherType.Identity],
                    headerTx: "common.identity",
                  },
                })
              },
            }
          case "shares":
            total = await getCipherCount([CipherType.Login], false, true)
            return {
              label: "shares.shares",
              total,
              image: BROWSE_ITEMS.shares,
              notiCount: shareNotiCount,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "shareStack",
                  params: {
                    screen: "sharesHome",
                  },
                })
              },
            }
          case "trash":
            total = await getCipherCount([], true)
            return {
              label: "common.trash",
              total,
              image: BROWSE_ITEMS.trash,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    headerTx: "common.trash",
                    isDeleted: true,
                  },
                })
              },
            }
        }
      }),
    )
    setData(_data as BrowseData[])
  }
  useEffect(() => {
    mount()
  }, [cipherStore.lastSync, cipherStore.lastCacheUpdate])

  return (
    <Screen
      padding
      safeAreaEdges={["bottom"]}
      header={<TabHeader titleTx="common.browse" />}
      backgroundColor={colors.block}
    >
      <MenuItemContainer>
        {data.map((item) => (
          <BrowserItem key={item.label} item={item} />
        ))}
      </MenuItemContainer>
    </Screen>
  )
})
