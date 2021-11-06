import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from 'lodash/orderBy'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { CipherView } from "../../../../../core/models/view"
import { CipherType } from "../../../../../core/enums"
import { AuthenticatorAction } from "./authenticator-action"
import { Button, Text } from "../../../../components"
import { color, commonStyles, fontSize } from "../../../../theme"
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { parseOTPUri, getTOTP } from "../../../../utils/totp"


interface Props {
  emptyContent?: JSX.Element,
  searchText?: string,
  onLoadingChange?: Function,
  sortList?: {
    orderField: string,
    order: string
  }
}

/**
 * Describe your component here
 */
export const OtpList = observer(function OtpList(props: Props) {
  const {
    emptyContent, onLoadingChange, searchText, sortList
  } = props
  const { getCiphers, translate } = useMixins()
  const { cipherStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [selectedOtp, setSelectedOtp] = useState(new CipherView())
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [ciphers, setCiphers] = useState([])
  const [otps, setOtps] = useState([])

  // ------------------------ WATCHERS ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastOfflineSync, sortList])

  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    // onLoadingChange && onLoadingChange(true)

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
        notSync: cipherStore.notSynchedCiphers.includes(c.id)
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
    setCiphers(res)
    updateOtp(res)
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
    return (period + 1) - Math.round(new Date().getTime() / 1000) % period
  }

  // ------------------------ RENDER ----------------------------

  return ciphers.length ? (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

      <AuthenticatorAction
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        onLoadingChange={onLoadingChange}
        cipher={selectedOtp}
      />

      {/* Action menus end */}

      {/* Cipher list */}
      <FlatList
        style={{ paddingHorizontal: 20 }}
        data={otps}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => (
          <Button
            preset="link"
            onPress={() => openActionMenu(item)}
            style={{
              borderBottomColor: color.line,
              borderBottomWidth: 1,
              paddingVertical: 15
            }}
          >
            <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              justifyContent: 'space-between'
            }]}>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { flexWrap: 'wrap' }]}>
                  <Text
                    preset="semibold"
                    text={item.name}
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
                    color: color.palette.green,
                    fontSize: fontSize.h3,
                  }}
                />
              </View>

              <CountdownCircleTimer
                onComplete={() => {
                  index === 0 && updateOtp()
                  return [true, 0]
                }}
                size={25}
                isPlaying
                duration={30}
                colors={color.palette.green}
                initialRemainingTime={getRemainingTime(item.otp.period)}
                strokeWidth={4}
              />
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
