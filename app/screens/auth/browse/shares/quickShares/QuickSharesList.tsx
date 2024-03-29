import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import orderBy from "lodash/orderBy"
import { QuickSharesCipherListItem } from "./QuickSharesListItem"
import { QuickSharesItemAction } from "./QuickSharesItemAction"
import { useCoreService } from "app/services/coreService"
import { useStores } from "app/models"
import { useCipherData, useHelper } from "app/services/hook"
import { SendView } from "core/models/view/sendView"
import { Logger } from "app/utils/utils"
import { Screen, Text } from "app/components/cores"
import { observer } from "mobx-react-lite"

type Props = {
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: (val: boolean) => void
  sortList?: {
    orderField: string
    order: string
  }
}

export const QuickSharesList = observer((props: Props) => {
  const { emptyContent, navigation, onLoadingChange, searchText, sortList } = props
  const { sendService } = useCoreService()
  const { cipherStore } = useStores()
  const { translate } = useHelper()
  const { syncQuickShares } = useCipherData()

  // ------------------------ PARAMS ----------------------------

  const [ciphers, setCiphers] = useState<SendView[]>([])
  const [showAction, setShowAction] = useState(false)
  const [selectedCipher, setSelectedCipher] = useState(null)

  useEffect(() => {
    syncQuickShares()
  }, [])

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSyncQuickShare, sortList])

  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    let res: SendView[] = []
    try {
      res = (await sendService.getAllDecrypted()) || []
    } catch (error) {
      Logger.error(error)
    }

    // search
    res = res.filter((s) => {
      if (
        s.cipher.name != null &&
        s.cipher.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
      ) {
        return true
      }
      return false
    })

    // Sort
    if (sortList) {
      const { orderField, order } = sortList
      res =
        orderBy(
          res,
          [(c) => (orderField === "name" ? c.name && c.name.toLowerCase() : c.revisionDate)],
          [order],
        ) || []
    }

    // Delay loading
    setTimeout(() => {
      onLoadingChange && onLoadingChange(false)
    }, 100)

    // Done
    setCiphers(res)
  }

  // ------------------------ RENDER ----------------------------

  return (
    <Screen contentContainerStyle={{ flex: 1 }}>
      <QuickSharesItemAction
        isOpen={showAction}
        onClose={() => setShowAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
        selectedCipher={selectedCipher}
      />

      <FlatList
        style={{
          paddingHorizontal: 20,
        }}
        data={ciphers}
        ListEmptyComponent={
          emptyContent && !searchText.trim() ? (
            <View style={{ paddingHorizontal: 20 }}>{emptyContent}</View>
          ) : (
            <View style={{ paddingHorizontal: 20 }}>
              <Text
                preset="label"
                text={translate("error.no_results_found") + ` '${searchText}'`}
                style={{
                  textAlign: "center",
                }}
              />
            </View>
          )
        }
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => (
          <QuickSharesCipherListItem
            item={item}
            openActionMenu={(val: any) => {
              setSelectedCipher(val)
              setShowAction(true)
            }}
          />
        )}
      />
    </Screen>
  )
})
