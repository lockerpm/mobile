import React, { useState, useEffect } from "react"
import { View, TouchableWithoutFeedback } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from 'lodash/orderBy'
import sortBy from 'lodash/sortBy'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { CipherView } from "../../../../../core/models/view"
import { CipherType } from "../../../../../core/enums"
import { AuthenticatorAction } from "./authenticator-action"
import { Button, Text } from "../../../../components"
import { commonStyles, fontSize } from "../../../../theme"
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { parseOTPUri, getTOTP } from "../../../../utils/totp"
import { Checkbox } from "react-native-ui-lib"
import { useCipherDataMixins } from "../../../../services/mixins/cipher/data"
import DraggableFlatList from 'react-native-draggable-flatlist'


interface Props {
  navigation: any
  emptyContent?: JSX.Element
  searchText?: string
  onLoadingChange?: Function
  sortList?: {
    orderField: string
    order: string
  }
  isSelecting: boolean
  setIsSelecting: Function
  selectedItems: string[]
  setSelectedItems: Function
  setAllItems: Function
}

/**
 * Describe your component here
 */
export const OtpList = observer((props: Props) => {
  const {
    navigation, emptyContent, onLoadingChange, searchText, sortList,
    isSelecting, setIsSelecting, selectedItems, setSelectedItems, setAllItems
  } = props
  const { translate, color } = useMixins()
  const { getCiphers } = useCipherDataMixins()
  const { cipherStore, toolStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [selectedOtp, setSelectedOtp] = useState(new CipherView())
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [ciphers, setCiphers] = useState([])
  const [otps, setOtps] = useState([])

  // ------------------------ EFFECT ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, sortList])

  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    onLoadingChange && onLoadingChange(true)

    // Filter
    const filters = [(c : CipherView) => c.type === CipherType.TOTP]

    // Search
    const searchRes = await getCiphers({
      filters,
      searchText,
      deleted: false,
      includeExtensions: true
    })

    // Add more info
    let res = searchRes.map((c: CipherView) => {
      const data = {
        ...c,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(c.id)
      }
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
    const sortedData = toolStore.authenticatorOrder.length > 0 ? sortBy(res, (item: CipherView) => {
      return toolStore.authenticatorOrder.indexOf(item.id)
    }) : [...res]
    setCiphers(sortedData)
    setAllItems(sortedData.map(c => c.id))
    updateOtp(sortedData)
  }

  // Handle action menu open
  const openActionMenu = (item: CipherView) => {
    setSelectedOtp(item)
    setIsActionOpen(true)
  }

  // Update OTP
  const updateOtp = (cs?) => {
    let data
    if (!cs) {
      data = [...ciphers]
    } else {
      data = [...cs]
    }
    setOtps(data.map(c => ({
      ...c,
      otp: parseOTPUri(c.notes)
    })))
  }

  // Calculate remaining time
  const getRemainingTime = (period: number) => {
    // Better late 1 sec than early
    return (period + 1) - Math.floor(new Date().getTime() / 1000) % period
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

  // Handle changing order
  const handleChangeOrder = ({ data }) => {
    setCiphers(data)
    updateOtp(data)
    toolStore.setAuthenticatorOrder(data.map((i: CipherView) => i.id))
  }

  // ------------------------ RENDER ----------------------------

  return otps.length ? (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

      <AuthenticatorAction
        navigation={navigation}
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        onLoadingChange={onLoadingChange}
        cipher={selectedOtp}
      />

      {/* Action menus end */}

      {/* Cipher list */}
      <DraggableFlatList
        style={{ paddingHorizontal: 20, height: '100%' }}
        data={otps}
        keyExtractor={item => item.id.toString()}
        onDragEnd={handleChangeOrder}
        renderItem={({ item, index, drag, isActive }) => (
          <Button
            preset="link"
            onPress={() => {
              if (isSelecting) {
                toggleItemSelection(item)
              } else {
                openActionMenu(item)
              }
            }}
            onLongPress={() => {
              if (isSelecting) {
                drag()
              } else {
                toggleItemSelection(item)
              }
            }}
            style={{
              borderBottomColor: color.line,
              borderBottomWidth: 0.5,
              paddingVertical: 15,
              backgroundColor: color.background
            }}
          >
            <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              justifyContent: 'space-between'
            }]}>
              {/* Drag anchor */}
              {
                isSelecting && (
                  <TouchableWithoutFeedback
                    onPressIn={() => {
                      drag()
                    }}
                  >
                    <View style={{
                      paddingVertical: 10,
                      paddingRight: 15,
                    }}>
                      <MaterialCommunityIconsIcon
                        name="menu"
                        size={18}
                        color={color.textBlack}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                )
              }
              {/* Drag anchor end */}

              {/* Content */}
              <View style={{ flex: 1 }}>
                <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { flexWrap: 'wrap' }]}>
                  <Text
                    preset="semibold"
                    text={item.name}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  />

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

                <Text
                  text={getTOTP(item.otp)}
                  style={{
                    color: color.primary,
                    fontSize: fontSize.h3,
                  }}
                />
              </View>
              {/* Content end */}

              {/* Couter/Select */}
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
                  <CountdownCircleTimer
                    onComplete={() => {
                      index === 0 && updateOtp()
                      return [true, 0]
                    }}
                    size={25}
                    isPlaying
                    duration={30}
                    colors={color.primary}
                    initialRemainingTime={getRemainingTime(item.otp.period)}
                    strokeWidth={4}
                  />
                )
              }
              {/* Couter/Select end */}
            </View>
          </Button>
        )}
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
