import { ViewStyle } from "react-native"
import { Text } from "app/components/cores"
import { CipherType } from "core/enums"
import { useStores } from "app/models"
import { FREE_PLAN_LIMIT } from "app/static/constants"
import { TxKeyPath } from "@/i18n"
import { CipherStorage } from "./CipherStorage"
import { AttachmentStorage } from "./AttachmentStorage"
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated"

interface PlanItemUsage {
  cipherType: CipherType[]
  tx: TxKeyPath
  limits: number
}

export const PlanUsage = () => {
  const { user } = useStores()

  const isFreeAccount = user.isFreePlan
  const items: PlanItemUsage[] = [
    {
      cipherType: [
        CipherType.Login,
        CipherType.SecureNote,
        CipherType.Card,
        CipherType.Identity,
        CipherType.CryptoWallet,
      ],
      tx: "manage_plan:usage.items",
      limits: FREE_PLAN_LIMIT.ITEMS,
    },
    {
      cipherType: [CipherType.TOTP],
      tx: "manage_plan:usage.otp",
      limits: FREE_PLAN_LIMIT.OTP,
    },
  ]
  // -------------------- RENDER ----------------------

  return (
    <Animated.View entering={FadeInUp} layout={LinearTransition} style={$content}>
      <Text preset="bold" tx={"manage_plan:usage.title"} />

      {items.map((e, index) => (
        <CipherStorage
          key={index}
          cipherType={e.cipherType}
          limits={e.limits}
          tx={e.tx}
          isUnlimited={!isFreeAccount}
        />
      ))}
      {!isFreeAccount && <AttachmentStorage tx={"file_attachment:title"} />}
    </Animated.View>
  )
}

const $content: ViewStyle = {
  padding: 16,
  paddingTop: 0,
}
