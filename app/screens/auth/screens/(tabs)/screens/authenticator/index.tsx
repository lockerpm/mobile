import { FC, useCallback, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen } from "app/components/cores"
import { useStores } from "app/models"
import { FREE_PLAN_LIMIT } from "app/static/constants"
import { AuthenticatorHeader } from "./OTPHeader"
import { CipherActionsModal, CipherAppView } from "@/static/types"
import { TabsScreenProps } from "@/navigators"
import { CipherType } from "core/enums"
import { delay } from "@/utils/delay"
import { OTPAddAction, OtpList } from "@/components/ciphers"

export const AuthenticatorScreen: FC<TabsScreenProps<"authenticatorTab">> = observer(
  ({ navigation }) => {
    const { user } = useStores()

    // -------------------- PARAMS ----------------------

    const [otpCount, setOtpCount] = useState(0)
    const [isAddOpen, setIsAddOpen] = useState(false)

    const disableAddmore = user.isFreePlan && otpCount === FREE_PLAN_LIMIT.OTP
    // -------------------- METHODS ----------------------

    const navigateToCipherActions = useCallback(
      (item: CipherAppView) => {
        const data: CipherAppView = {
          ...item,
          revisionDate: null,
        }
        navigation.navigate("cipherActionsModal", {
          mode: CipherActionsModal.OTP_ACTIONS,
          item: data,
          isDeleted: true, // permanent delete
          deleteIds: [item.id],
        })
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

    // -------------------- EFFECT ----------------------
    // -------------------- RENDER ----------------------

    return (
      <Screen
        safeAreaEdges={["top"]}
        header={<AuthenticatorHeader openAdd={openAddOtpMenu} />}
        contentContainerStyle={$container}
      >
        <OTPAddAction
          isOpen={isAddOpen}
          onClose={closeAddOtpMenu}
          navigateToQrScan={navigateToQrScan}
          navigateToAddCipher={navigateToAddCipher}
        />

        <OtpList
          setOtpCount={setOtpCount}
          openActionMenu={navigateToCipherActions}
          openAddMenu={openAddOtpMenu}
        />
      </Screen>
    )
  }
)

const $container: ViewStyle = {
  flex: 1,
}
