import { FC } from "react"

import { PasskeyUnlock } from "app/components/utils"
import { SettingsScreenProps } from "app/navigators/navigators.types"

export const VerifyPasskeyScreen: FC<SettingsScreenProps<"verifyPasskey">> = ({
  navigation,
  route: { params },
}) => {
  return (
    <PasskeyUnlock
      lockConfig={params.lockConfig}
      titleTx="export:verify"
      descTx="export:verify_passkey_desc"
      onBack={navigation.goBack}
      onUnlocked={() => {
        // Back to the master password screen, which opens the export screen
        navigation.navigate({
          name: "verifyMasterPassword",
          params: { passkeyVerifiedAt: Date.now() },
          merge: true,
        })
      }}
    />
  )
}
