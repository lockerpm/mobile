import React, { useState, useEffect } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from "lodash/orderBy"
import sortBy from "lodash/sortBy"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { CipherType } from "../../../../../../core/enums"
import { Text } from "../../../../../components"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import DraggableFlatList from "react-native-draggable-flatlist"
import { OtpListItem } from "./otp-list-item"

interface Props {
  searchText: string
  sortList?: {
    orderField: string
    order: string
  }
  selectedOtp: CipherView
  setSelectedOtp: (val: CipherView) => void
}

/**
 * Describe your component here
 */
export const OtpList = observer((props: Props) => {
  const {  searchText, sortList, selectedOtp, setSelectedOtp } = props
  const { translate } = useMixins()
  const { getCiphersFromCache } = useCipherDataMixins()
  const { cipherStore, toolStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [ciphers, setCiphers] = useState([])

  // ------------------------ EFFECT ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, sortList])



  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    // Filter
    const filters = [(c: CipherView) => c.type === CipherType.TOTP]

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false,
      includeExtensions: true,
    })

    // Add more info
    let res = searchRes.map((c: CipherView) => {
      const data = {
        ...c,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
          c.id,
        ),
      }
      return data
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

    // Done
    const sortedData =
      toolStore.authenticatorOrder.length > 0
        ? sortBy(res, (item: CipherView) => {
            return toolStore.authenticatorOrder.indexOf(item.id)
          })
        : [...res]
    setCiphers(sortedData)
  }

  // Handle changing order
  const handleChangeOrder = ({ data }) => {
    setCiphers(data)
    toolStore.setAuthenticatorOrder(data.map((i: CipherView) => i.id))
  }

  // ------------------------ RENDER ----------------------------

  const renderItem = ({ item}) => (
    <OtpListItem
      item={item}
      openActionMenu={setSelectedOtp}
      isSelected={selectedOtp?.id === item.id}
    />
  )

  return (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

      {/* <AuthenticatorAction
        navigation={navigation}
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        onLoadingChange={onLoadingChange}
        cipher={selectedOtp}
      /> */}

      {/* Action menus end */}

      {/* Cipher list */}
      <DraggableFlatList
        style={{  height: "100%" }}
        contentContainerStyle={{
          paddingTop: 16
        }}
        data={ciphers}
        keyExtractor={(item) => item.id.toString()}
        onDragEnd={handleChangeOrder}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 20 }}>
            <Text
              text={translate("error.no_results_found") + ` '${searchText}'`}
              style={{
                textAlign: "center",
              }}
            />
          </View>
        }
      />
      {/* Cipher list end */}
    </View>
  )
})
