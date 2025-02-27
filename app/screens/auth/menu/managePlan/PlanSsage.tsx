import React, { useEffect, useState } from "react"
import { View, ViewStyle, StyleProp } from "react-native"
import { Text, Button } from "app/components/cores"
import { useNavigation } from "@react-navigation/native"
import ProgressBar from "react-native-ui-lib/progressBar"
import { CipherType } from "core/enums"
import { useTheme } from "app/services/context"
import { useHelper, useTool } from "app/services/hook"
import { useStores } from "app/models"
import { FREE_PLAN_LIMIT } from "app/static/constants"

interface PlanItemUsage {
  cipherType: CipherType[]
  title: string
  limits: number
}

interface PlanStorageProps {
  style?: StyleProp<ViewStyle>
  isUnlimited?: boolean
  cipherType: CipherType[]
  limits: number
  title: string
}

const ItemStorage = (props: PlanStorageProps) => {
  const { cipherType, style, limits, title, isUnlimited } = props
  const { colors } = useTheme()
  const { getCipherCount } = useTool()

  const [cipherCount, setCipherCount] = useState(0)

  const usagePercentage = (cipherCount / limits) * 100
  const backgroundColor =
    usagePercentage >= 80
      ? usagePercentage >= 100
        ? colors.error
        : colors.warning
      : colors.primary

  useEffect(() => {
    const counting = async () => {
      const count = await getCipherCount(cipherType)

      setCipherCount(count)
    }
    counting()
  }, [])

  return (
    <View style={[{ width: "100%", marginVertical: 4 }, style]}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text
          text={title + " "}
          style={{
            maxWidth: "75%",
          }}
        />
        {isUnlimited ? (
          <Text text={cipherCount.toString()} />
        ) : (
          <Text>
            {cipherCount}/{isUnlimited ? "∞" : limits}
          </Text>
        )}
      </View>

      {!isUnlimited && (
        <ProgressBar
          style={{
            height: 6,
            borderRadius: 4,
            backgroundColor: colors.block,
          }}
          progressColor={backgroundColor}
          // @ts-ignore
          progress={isUnlimited ? 0 : Math.min((cipherCount / limits) * 100, 100)}
        />
      )}
    </View>
  )
}

export const PlanUsage = () => {
  const { colors } = useTheme()
  const navigation = useNavigation() as any
  const { user } = useStores()
  const { translate } = useHelper()

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
      title: translate("manage_plan.usage.items"),
      limits: FREE_PLAN_LIMIT.ITEMS,
    },
    {
      cipherType: [CipherType.TOTP],
      title: translate("manage_plan.usage.otp"),
      limits: FREE_PLAN_LIMIT.OTP,
    },
  ]
  // -------------------- RENDER ----------------------

  return (
    <View style={{ padding: 16, paddingBottom: 0 }}>
      <View
        style={{
          borderRadius: 10,
          padding: 16,
          backgroundColor: colors.background,
        }}
      >
        {isFreeAccount && <Text preset="bold" text={"Plan Usage"} />}
        {!isFreeAccount && (
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Text preset="default" text={"Plan Usage"} />
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 10,
                paddingVertical: 3,
                backgroundColor: colors.primary,
                borderRadius: 3,
              }}
            >
              <Text
                preset="bold"
                text={
                  user.pwd_user_type === "enterprise"
                    ? translate("common.enterprise")
                    : user.plan?.name.toUpperCase()
                }
                size="base"
                style={{
                  color: colors.background,
                }}
              />
            </View>
          </View>
        )}

        {items.map((e, index) => (
          <ItemStorage
            key={index}
            cipherType={e.cipherType}
            limits={e.limits}
            title={e.title}
            isUnlimited={!isFreeAccount}
          />
        ))}
      </View>
      {isFreeAccount && (
        <Button
          onPress={() => {
            navigation.navigate("payment")
          }}
          text={translate("manage_plan.free.button")}
          style={{ marginTop: 12 }}
        />
      )}
    </View>
  )
}
