import { FC, useCallback, useEffect, useState } from "react"
import { BackHandler, NativeModules, ViewStyle } from "react-native"
import { AutoFillList } from "./AutofillList"
import { AndroidAutofillServiceType } from "app/utils/autofillHelper"
import { useCipherData } from "app/services/hook"
import { CipherView } from "core/models/view"
import { CipherType } from "core/enums"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { Screen } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { AndroidAutofillScreenProps } from "@/navigators"
import { useClipboard, useToast } from "@/services/utils"
import { ListHeader } from "./ListHeader"
import { CipherAppView } from "@/static/types"
import { MotionLoading } from "@/components/utils"

const { RNAutofillServiceAndroid } = NativeModules

export const AndroidAutofillScreen: FC<AndroidAutofillScreenProps<"passwordList">> = observer(
  ({
    navigation,
    route: {
      params: { data },
    },
  }) => {
    const { getCiphersFromCache } = useCipherData()
    const { copyToClipboard } = useClipboard()
    const { notifyTx } = useToast()

    const isLastFillItem =
      data.type === AndroidAutofillServiceType.AUTOFILL_ITEM && data.lastUserPasswordID
    const [showListPassword, setShowListPassword] = useState(!isLastFillItem)

    // -------------------- Methods ----------------------------
    const navigateToAddCipher = useCallback(() => {
      navigation.navigate("browseStack", {
        screen: "cipherEdit",
        params: {
          mode: "add",
          initialUrl: data.domain,
          cipherType: CipherType.Login,
        },
      })
    }, [data.domain, navigation])

    const navigateToCipherActions = useCallback(
      (item: CipherAppView) => {
        navigation.navigate("passwordActionsModal", {
          item,
        })
      },
      [navigation]
    )

    const navigateToGeneratePassword = useCallback(() => {
      navigation.navigate("passwordGenModal")
    }, [navigation])

    const handleAutofillLastItem = useCallback(async () => {
      if (isLastFillItem) {
        const allLogins = await getCiphersFromCache({
          deleted: false,
          searchText: "",
          filters: [(c: CipherView) => c.id === data.lastUserPasswordID],
        })

        if (allLogins.length > 0) {
          RNAutofillServiceAndroid.useLastItem()
          if (allLogins[0].login.hasTotp) {
            const otp = getTOTP(parseOTPUri(allLogins[0].login.totp))
            copyToClipboard(otp)
          }
        } else {
          setShowListPassword(true)
          RNAutofillServiceAndroid.removeLastItem()
          notifyTx("info", "autofill_service:deleted")
        }
      }
    }, [data.lastUserPasswordID, data.type])

    // -------------------- EFFECT ----------------------------
    // Suggest save
    useEffect(() => {
      handleAutofillLastItem()
    }, [handleAutofillLastItem])

    // -------------------- RENDER ----------------------------

    return (
      <Screen
        safeAreaEdges={["bottom", "top"]}
        header={
          <ListHeader
            headerTx="common:passwords"
            goBack={BackHandler.exitApp}
            openAdd={navigateToAddCipher}
            openPasswordGenerator={navigateToGeneratePassword}
          />
        }
        contentContainerStyle={$container}
      >
        {showListPassword && (
          <AutoFillList
            domain={data.domain}
            openActionMenu={navigateToCipherActions}
            navigateToAddCipher={navigateToAddCipher}
          />
        )}
        {!showListPassword && <MotionLoading disableProgress />}
      </Screen>
    )
  }
)

const $container: ViewStyle = {
  flex: 1,
}
