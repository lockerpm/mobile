import { FC, useCallback, useState } from "react"
import { ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

import { Screen, Header, Text, PressableScale } from "app/components/cores"
import { useStores } from "app/models"
import { FREE_PLAN_LIMIT } from "app/static/constants"
import { CipherType } from "core/enums"

import { OTPAddAction, OtpList } from "@/components/ciphers"
import { BrowseScreenProps } from "@/navigators"
import { CipherActionsModal, CipherAppView } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { delay } from "@/utils/delay"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

export const OtpSelectScreen: FC<BrowseScreenProps<"otpSelect">> = observer(
  ({
    navigation,
    route: {
      params: { selectedOtp },
    },
  }) => {
    const { user } = useStores()
    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    // -------------------- PARAMS ----------------------

    const [otpCount, setOtpCount] = useState(0)
    const [isAddOpen, setIsAddOpen] = useState(false)

    const disableAddmore = user.isFreePlan && otpCount === FREE_PLAN_LIMIT.OTP
    // -------------------- METHODS ----------------------

    const onSelectPasswordOtp = useCallback(
      (item?: CipherAppView) => {
        EventBus.emit(AppEventType.CIPHER_EDIT_OTP_SELECT, item?.notes || "")
        navigation.goBack()
      },
      [navigation]
    )

    const openAddOtpMenu = useCallback(() => {
      if (disableAddmore) {
        navigation.navigate("cipherActionsModal", {
          mode: CipherActionsModal.PREMIUM_LIMIT,
          deleteIds: [],
        })
      } else {
        setIsAddOpen(true)
      }
    }, [disableAddmore, navigation])

    const closeAddOtpMenu = useCallback(() => {
      setIsAddOpen(false)
    }, [])

    const navigateToQrScan = useCallback(() => {
      setIsAddOpen(false)
      delay(20).then(() => {
        navigation.navigate("qrScannerModal")
      })
    }, [navigation])

    const navigateToAddCipher = useCallback(() => {
      setIsAddOpen(false)
      delay(20).then(() => {
        navigation.navigate("browseStack", {
          screen: "cipherEdit",
          params: {
            mode: "add",
            cipherType: CipherType.TOTP,
          },
        })
      })
    }, [navigation])

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="authenticator:title"
            rightIcon="plus"
            onRightPress={openAddOtpMenu}
          />
        }
        contentContainerStyle={$container}
      >
        <OTPAddAction
          isOpen={isAddOpen}
          onClose={closeAddOtpMenu}
          navigateToQrScan={navigateToQrScan}
          navigateToAddCipher={navigateToAddCipher}
        />

        <OtpList
          isPasswordEdit
          selectedOtp={selectedOtp}
          setOtpCount={setOtpCount}
          openActionMenu={onSelectPasswordOtp}
          openAddMenu={openAddOtpMenu}
          ListHeaderComponent={
            <PressableScale
              style={[
                themed($item),
                { borderColor: !selectedOtp ? colors.primary : colors.border },
              ]}
              onPress={() => onSelectPasswordOtp()}
            >
              <Text tx="password:no_otp" />
            </PressableScale>
          }
        />
      </Screen>
    )
  }
)

const $item: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $container: ViewStyle = {
  flex: 1,
}
