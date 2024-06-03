import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from "lodash/orderBy"
import { AutofillListItem } from "./AutofillListItem"
import { Text } from "app/components/cores"
import { useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { CipherType } from "core/enums"
import { AutoFillItemAction } from "./AutofillItemAction"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { useTheme } from "app/services/context"
import { TouchableOpacity } from "react-native-gesture-handler"

interface AutoFillListProps {
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  sortList?: {
    orderField: string
    order: string
  }
  setSearchText: (val: string) => void
  suggestSearch: string[]
}

/**
 * Describe your component here
 */
export const AutoFillList = observer((props: AutoFillListProps) => {
  const { emptyContent, navigation, searchText, sortList, suggestSearch, setSearchText } = props
  const { translate } = useHelper()
  const { getWebsiteLogo } = useCipherHelper()
  const { getCiphersFromCache } = useCipherData()
  const { colors } = useTheme()
  const { cipherStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [showPasswordAction, setShowPasswordAction] = useState(false)
  const [ciphers, setCiphers] = useState([])

  // ------------------------ WATCHERS ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, sortList])

  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    // Filter
    const filters = []
    filters.push((c: CipherView) => c.type === CipherType.Login)

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false,
    })

    // Add image
    let res = searchRes.map((c: CipherView) => {
      const data = {
        ...c,
        logo: null,
        imgLogo: null,
        svg: null,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
          c.id
        ),
        isDeleted: c.isDeleted,
      }
      let img = {}
      const { uri } = getWebsiteLogo(c.login.uri)
      if (uri) {
        img = { uri }
      } else {
        img = BROWSE_ITEMS.password.icon
      }
      data.imgLogo = img
      data.logo = BROWSE_ITEMS.password.icon
      return data
    })

    // Sort
    if (sortList) {
      const { orderField, order } = sortList
      res =
        orderBy(
          res,
          [(c) => (orderField === "name" ? c.name && c.name.toLowerCase() : c.revisionDate)],
          [order]
        ) || []
    }

    // Done
    setCiphers(res)
  }

  // Handle action menu open
  const openActionMenu = (item: CipherView) => {
    cipherStore.setSelectedCipher(item)
    setShowPasswordAction(true)
  }

  // ------------------------ RENDER ----------------------------

  const renderItem = ({ item }) => <AutofillListItem item={item} openActionMenu={openActionMenu} />

  return ciphers.length ? (
    <View style={{ flex: 1 }}>
      <AutoFillItemAction
        isOpen={showPasswordAction}
        onClose={() => setShowPasswordAction(false)}
        navigation={navigation}
      />

      <FlatList
        style={{
          paddingHorizontal: 20,
        }}
        data={ciphers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        getItemLayout={(data, index) => ({
          length: 71,
          offset: 71 * index,
          index,
        })}
      />
    </View>
  ) : emptyContent && !searchText.trim() ? (
    <View style={{ paddingHorizontal: 20, marginTop: 16 }}>{emptyContent}</View>
  ) : (
    <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
      <Text preset="label" text={translate("error.no_results_found") + ` '${searchText}'`} />
      {suggestSearch.length > 1 && searchText === suggestSearch[0] && (
        <View>
          <Text
            preset="label"
            text={translate("autofill_service.searchFor")}
            style={{
              marginTop: 8,
              marginBottom: 16,
            }}
          />
          <View
            style={{
              backgroundColor: colors.block,
              borderRadius: 12,
              paddingVertical: 4,
            }}
          >
            {suggestSearch.slice(1).map((text, index) => (
              <TouchableOpacity
                key={text}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderBottomColor: colors.disable,
                  borderBottomWidth: index !== suggestSearch.length - 2 ? 1 : 0,
                }}
                onPress={() => {
                  setSearchText(text)
                }}
              >
                <Text text={text} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  )
})
