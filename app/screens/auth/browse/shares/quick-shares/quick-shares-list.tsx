import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from "lodash/orderBy"
import { Text } from "../../../../../components/text/text"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { QuickSharesCipherListItem } from "./quick-shares-list-item"
import { useCoreService } from "../../../../../services/core-service"
import { SendView } from "../../../../../../core/models/view/sendView"
import { QuickSharesItemAction } from "./quick-shares-item-action"

type Props = {
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: Function
  sortList?: {
    orderField: string
    order: string
  }
}

export const QuickSharesList = observer((props: Props) => {
  const { emptyContent, navigation, onLoadingChange, searchText, sortList } = props
  const { translate } = useMixins()
  const { sendService } = useCoreService()
  const { cipherStore } = useStores()
  // ------------------------ PARAMS ----------------------------

  const [ciphers, setCiphers] = useState<SendView[]>([])
  const [showAction, setShowAction] = useState(false)
  const [selectedCipher, setSelectedCipher] = useState(null)

  useEffect(() => {
    loadData()
  }, [
    searchText,
    cipherStore.lastSync,
    cipherStore.lastCacheUpdate,
    sortList,
    JSON.stringify(cipherStore.myShares),
  ])
  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    let res: SendView[] = []
    try {
      res = (await sendService.getAllDecrypted()) || []
    } catch (error) {
      console.log(error)
    }

    // search
    res = res.filter((s) => {
      if (s.cipher.name != null && s.cipher.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
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

  return ciphers.length ? (
    <View style={{ flex: 1 }}>
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
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item, index }) => (
          <QuickSharesCipherListItem item={item} openActionMenu={(val: any)  => {
            setSelectedCipher(val)
            setShowAction(true)
          }} />
        )}
      />
    </View>
  ) : emptyContent && !searchText.trim() ? (
    <View style={{ paddingHorizontal: 20 }}>{emptyContent}</View>
  ) : (
    <View style={{ paddingHorizontal: 20 }}>
      <Text
        text={translate("error.no_results_found") + ` '${searchText}'`}
        style={{
          textAlign: "center",
        }}
      />
    </View>
  )
})
