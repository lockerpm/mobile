import { FC, useEffect, useState } from "react"
import { ImageSourcePropType, ViewStyle } from "react-native"
import { useAtomValue } from "jotai"
import { observer } from "mobx-react-lite"

import { Screen, TabHeader } from "app/components/cores"
import { MenuItemContainer } from "app/components/utils"
import { TxKeyPath } from "app/i18n"
import { useStores } from "app/models"
import { TabsScreenProps } from "app/navigators"
import { useTool } from "app/services/hook"
import { CipherType } from "core/enums"

import { confirmShareAtom } from "@/services/utils/useConfirmShare"
import { useAppTheme } from "@/utils/useAppTheme"

import { BrowserItem } from "./BrowserItem"

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
  const {
    theme: { colors },
  } = useAppTheme()
  const { cipherStore, folderStore, collectionStore } = useStores()
  const { getCipherCount } = useTool()

  const [data, setData] = useState<BrowseData[]>([])
  const confirmShareCount = useAtomValue(confirmShareAtom)

  const shareNotiCount = cipherStore.sharingInvitationsIgnoreAccept.length + confirmShareCount

  const mount = async () => {
    const temp = Object.keys(BROWSE_ITEMS) as BrowseRoute[]
    const _data: BrowseData[] = await Promise.all(
      temp.map(async (key) => {
        let total = 0
        switch (key) {
          case "folder":
            total = folderStore.folders.length + collectionStore.collections.length
            return {
              label: "common:folders",
              total,
              image: BROWSE_ITEMS.folder,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "folderList",
                })
              },
            }
          case "password":
            total = await getCipherCount([CipherType.Login])
            return {
              label: "common:passwords",
              total,
              image: BROWSE_ITEMS.password,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    cipherTypes: [CipherType.Login],
                    headerTx: "common:passwords",
                  },
                })
              },
            }
          case "note":
            total = await getCipherCount([CipherType.SecureNote])
            return {
              label: "common:note",
              total,
              image: BROWSE_ITEMS.note,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    cipherTypes: [CipherType.SecureNote],
                    headerTx: "common:note",
                  },
                })
              },
            }
          case "card":
            total = await getCipherCount([CipherType.Card])
            return {
              label: "common:card",
              total,
              image: BROWSE_ITEMS.card,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    cipherTypes: [CipherType.Card],
                    headerTx: "common:card",
                  },
                })
              },
            }
          case "cryptoWallet":
            total = await getCipherCount([CipherType.CryptoWallet])
            return {
              label: "common:crypto_wallet",
              total,
              image: BROWSE_ITEMS.cryptoWallet,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    cipherTypes: [CipherType.CryptoWallet],
                    headerTx: "common:crypto_wallet",
                  },
                })
              },
            }
          case "identity":
            total = await getCipherCount([CipherType.Identity])
            return {
              label: "common:identity",
              total,
              image: BROWSE_ITEMS.identity,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    cipherTypes: [CipherType.Identity],
                    headerTx: "common:identity",
                  },
                })
              },
            }
          case "shares":
            total = await getCipherCount([CipherType.Login], false, true)
            return {
              label: "shares:shares",
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
              label: "common:trash",
              total,
              image: BROWSE_ITEMS.trash,
              onPress: () => {
                navigation.navigate("browseStack", {
                  screen: "cipherList",
                  params: {
                    headerTx: "common:trash",
                    isDeleted: true,
                  },
                })
              },
            }
        }
      })
    )
    setData(_data as BrowseData[])
  }
  useEffect(() => {
    mount()
  }, [cipherStore.lastSync, cipherStore.lastCacheUpdate, shareNotiCount])

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      header={<TabHeader titleTx="common:browse" />}
      backgroundColor={colors.block}
      contentContainerStyle={$container}
    >
      <MenuItemContainer>
        {data.map((item) => (
          <BrowserItem key={item.label} item={item} />
        ))}
      </MenuItemContainer>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: 16,
}
