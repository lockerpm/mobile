import { useState, useEffect } from "react"
import { FlatList, View, ViewStyle } from "react-native"
import { QuickSharesItem } from "./QuickSharesItem"
import { useCoreService } from "app/services/coreService"
import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"
import { SendView } from "core/models/view/sendView"
import { observer } from "mobx-react-lite"
import { Logger } from "@/utils/logger"
import { EmptyCipherList } from "@/components/ciphers"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  openActions: (item: SendView) => void
}

const SHARE_EMPTY = require("assets/images/emptyCipherList/share-empty-img.png")

export const QuickSharesList = observer(({ openActions }: Props) => {
  const { themed } = useAppTheme()
  const { sendService } = useCoreService()
  const { cipherStore, user } = useStores()
  const { syncQuickShares } = useCipherData()

  const isFreeAccount = user.isFreePlan
  // ------------------------ PARAMS ----------------------------

  const [ciphers, setCiphers] = useState<SendView[]>([])

  useEffect(() => {
    syncQuickShares()
  }, [])

  useEffect(() => {
    loadData()
  }, [cipherStore.lastSyncQuickShare])

  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    let res: SendView[] = []
    try {
      res = (await sendService.getAllDecrypted()) || []
    } catch (error) {
      Logger.error(error)
    }
    setCiphers(res)
  }

  // ------------------------ RENDER ----------------------------

  return (
    <FlatList
      contentContainerStyle={$content}
      data={ciphers}
      ListEmptyComponent={
        <EmptyCipherList
          image={SHARE_EMPTY}
          titleTx={isFreeAccount ? "shares:empty.title" : "shares:empty.title"}
          descTx={isFreeAccount ? "error:not_available_for_free" : "shares:empty.desc_share"}
        />
      }
      ItemSeparatorComponent={() => <View style={themed($divider)} />}
      keyExtractor={(item, index) => String(index)}
      renderItem={({ item }) => <QuickSharesItem item={item} openActionMenu={openActions} />}
    />
  )
})

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})

const $content: ViewStyle = {
  paddingHorizontal: 16,
}
