import React, { useState, useEffect } from "react"
import { View, FlatList, NativeModules } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from 'lodash/orderBy'
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { CipherType } from "../../../../core/enums"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { CipherView } from "../../../../core/models/view"
import { BROWSE_ITEMS } from "../../../common/mappings"
import { commonStyles, fontSize } from "../../../theme"
import { Checkbox } from "react-native-ui-lib"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { Button, AutoImage as Image, Text } from "../../../components"
import { AutoFillItemAction } from "./autofill-item-action"

const { RNAutofillServiceAndroid } = NativeModules

interface AutoFillListProps {
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: Function
  sortList?: {
    orderField: string
    order: string
  },
  isSelecting: boolean
  setIsSelecting: Function
  selectedItems: string[]
  setSelectedItems: Function
  setAllItems: Function
}

/**
 * Describe your component here
 */
export const AutoFillList = observer(function AutoFillList(props: AutoFillListProps) {
  const {
    emptyContent, navigation, onLoadingChange, searchText, sortList,
    isSelecting, setIsSelecting, selectedItems, setSelectedItems, setAllItems
  } = props
  const { getWebsiteLogo, translate, color } = useMixins()
  const { getCiphersFromCache } = useCipherDataMixins()
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
    // onLoadingChange && onLoadingChange(true)

    // Filter
    const filters = []
    filters.push((c : CipherView) => c.type === CipherType.Login)

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false
    })

    // Add image
    let res = searchRes.map((c: CipherView) => {
      const data = {
        ...c,
        logo: null,
        imgLogo: null,
        svg: null,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(c.id),
        isDeleted: c.isDeleted
      }
      if (c.login.uri) {
        data.imgLogo = getWebsiteLogo(c.login.uri)
      }
      data.logo = BROWSE_ITEMS.password.icon
      return data
    })

    // Sort
    if (sortList) {
      const { orderField, order } = sortList
      res = orderBy(
        res,
        [c => orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate],
        [order]
      ) || []
    }

    // Delay loading
    setTimeout(() => {
      onLoadingChange && onLoadingChange(false)
    }, 100)

    // Done
    setCiphers(res)
    setAllItems(res.map(c => c.id))
  }

  // Handle action menu open
  const openActionMenu = (item: CipherView) => {
    cipherStore.setSelectedCipher(item)
    setShowPasswordAction(true)
  }

  // Go to detail
  const selectForAutoFill = (item: CipherView) => {
    RNAutofillServiceAndroid.addAutofillValue(
      item.id,
      item.login.username,
      item.login.password,
      item.name,
      item.login.uri
    )
  }

  // Get cipher description
  const getDescription = (item: CipherView) => {
    return item.login.username
  }

  // Toggle item selection
  const toggleItemSelection = (item: CipherView) => {
    if (!isSelecting) {
      setIsSelecting(true)
    }
    let selected = [...selectedItems]
    if (!selected.includes(item.id)) {
      selected.push(item.id)
    } else {
      selected = selected.filter(id => id !== item.id)
    }
    setSelectedItems(selected)
  }

  // ------------------------ RENDER ----------------------------

  const renderItem = ({ item }) => (
    <Button
      preset="link"
      onPress={() => {
        if (isSelecting) {
          toggleItemSelection(item)
        } else {
          selectForAutoFill(item)
        }
      }}
      onLongPress={() => toggleItemSelection(item)}
      style={{
        borderBottomColor: color.line,
        borderBottomWidth: 0.5,
        paddingVertical: 15,
        height: 70.5
      }}
    >
      <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
        {
          item.svg ? (
            <item.svg height={40} width={40} />
          ) : (
            <Image
              source={item.imgLogo || item.logo}
              backupSource={item.logo}
              style={{
                height: 40,
                width: 40,
                borderRadius: 8
              }}
            />
          )
        }

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
            <View style={{ flex: 1 }}>
              <Text
                preset="semibold"
                numberOfLines={1}
                text={item.name}
              />
            </View>

            {
              item.organizationId && (
                <View style={{ marginLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="account-group-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )
            }

            {
              item.notSync && (
                <View style={{ marginLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="cloud-off-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )
            }
          </View>

          {
            !!getDescription(item) && (
              <Text
                text={getDescription(item)}
                style={{ fontSize: fontSize.small }}
                numberOfLines={1}
              />
            )
          }
        </View>

        {
          isSelecting ? (
            <Checkbox
              value={selectedItems.includes(item.id)}
              color={color.primary}
              onValueChange={() => {
                toggleItemSelection(item)
              }}
            />
          ) : (
            <Button
              preset="link"
              onPress={() => openActionMenu(item)}
              style={{ height: 40, alignItems: 'center' }}
            >
              <IoniconsIcon
                name="ellipsis-horizontal"
                size={18}
                color={color.textBlack}
              />
            </Button>
          )
        }
      </View>
    </Button>
  )

  return ciphers.length ? (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

      <AutoFillItemAction
        isOpen={showPasswordAction}
        onClose={() => setShowPasswordAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      {/* Action menus end */}

      {/* Cipher list */}
      <FlatList
        style={{ 
          paddingHorizontal: 20, 
        }}
        data={ciphers}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        getItemLayout={(data, index) => ({
          length: 71,
          offset: 71 * index,
          index
        })}
      />
      {/* Cipher list end */}
    </View>
  ) : (
    emptyContent && !searchText.trim() ? (
      <View style={{ paddingHorizontal: 20 }}>
        {emptyContent}
      </View>
    ) : (
      <View style={{ paddingHorizontal: 20 }}>
        <Text
          text={translate('error.no_results_found') + ` '${searchText}'`}
          style={{
            textAlign: 'center'
          }}
        />
      </View>
    )
  )
})
