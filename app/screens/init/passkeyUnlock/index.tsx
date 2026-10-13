import { FC } from "react"

import { PasskeyUnlock } from "app/components/utils"
import { AppScreenProps } from "app/navigators/navigators.types"
import { LockType } from "app/static/types/enum"

export const PasskeyUnlockScreen: FC<AppScreenProps<"passkeyUnlock">> = ({
  navigation,
  route: { params },
}) => {
  return (
    <PasskeyUnlock
      lockConfig={params.lockConfig}
      titleTx="common:unlock"
      descTx="lock:passkey.desc"
      onBack={navigation.goBack}
      onUnlocked={() => {
        // Back to the lock screen, which finishes the unlock flow
        navigation.navigate({
          name: "lock",
          params: { type: LockType.Individual, passkeyUnlockedAt: Date.now() },
          merge: true,
        })
      }}
    />
  )
}
