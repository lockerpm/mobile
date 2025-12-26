import { FC } from "react"
import { BackHandler, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"

import { Header, Screen } from "@/components/cores"
import { AndroidAutofillScreenProps } from "@/navigators"
import { CipherAppView } from "@/static/types"
import { handleGetPasskeyResponse } from "@/utils/autofill.android"

import { PasskeyList } from "./PasskeyList"
import { usePasskeyListData } from "./usePasskeyListData"

export const PasskeyListScreen: FC<AndroidAutofillScreenProps<"passkeyList">> = observer(
  ({
    route: {
      params: { data },
    },
  }) => {
    const requestObj: PublicKeyCredentialRequestOptionsJSON = JSON.parse(data.requestJson)
    const { loginPasskeys, isLoading } = usePasskeyListData(requestObj)

    const selectPasskey = async (item: CipherAppView) => {
      const fido2Cred = item.login.fido2Credentials![0]

      await handleGetPasskeyResponse(fido2Cred)
    }

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={BackHandler.exitApp}
            titleTx="autofill_service:android_service.list_passkey.title"
          />
        }
        contentContainerStyle={styles.container}
      >
        <PasskeyList
          isLoading={isLoading}
          ciphers={loginPasskeys}
          selectPasskey={selectPasskey}
          rpId={requestObj.rpId || ""}
        />
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
