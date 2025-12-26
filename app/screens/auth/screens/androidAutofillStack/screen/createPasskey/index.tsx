import { FC } from "react"
import { BackHandler, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"

import { Header, Screen } from "@/components/cores"
import { AndroidAutofillScreenProps } from "@/navigators"

import { LoginContainPasskeyList } from "./LoginContainPasskeyList"
import { SimpleFido2View } from "./SimpleFido2View"
import { useCreatePasskeyCipher } from "./useCreatePasskeyCipher"
import { useCreatePasskeyData } from "./useCreatePasskeyData"

export const CreatePasskeyScreen: FC<AndroidAutofillScreenProps<"createPasskey">> = observer(
  ({
    route: {
      params: { data },
    },
  }) => {
    const requestObj: PublicKeyCredentialCreationOptionsJSON = JSON.parse(data.requestJson)
    const rpId = requestObj.rp.id || requestObj.rp.name

    const { existingPasskeys, loginPasskeys } = useCreatePasskeyData(rpId, requestObj.user.name)
    const { createNewCipher, addOrReplaceCipherFido2Credential } = useCreatePasskeyCipher(data)

    const isExistingPasskeys = !!existingPasskeys
    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={BackHandler.exitApp}
            titleTx="autofill_service:android_service.create_passkey.title"
          />
        }
        contentContainerStyle={styles.container}
      >
        {isExistingPasskeys && <SimpleFido2View rpId={rpId} userName={requestObj.user.name} />}

        {!isExistingPasskeys && (
          <LoginContainPasskeyList
            ciphers={loginPasskeys}
            createNewCipher={createNewCipher}
            addOrReplaceCipherFido2Credential={addOrReplaceCipherFido2Credential}
          />
        )}
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
