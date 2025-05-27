import React, { useEffect, useState } from "react"
import { View, ViewStyle, StyleProp } from "react-native"
import { Text, Button } from "app/components/cores"
import { useNavigation } from "@react-navigation/native"
import ProgressBar from "react-native-ui-lib/progressBar"
import { CipherType } from "core/enums"
import { useAppLocale, useTheme } from "app/services/context"
import { useTool } from "app/services/hook"
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

const convertBytesToGB = (bytes: number) => {
  return bytes / 1024 / 1024 / 1024
}

const AttachmentStorage = (props: { title: string }) => {
  const { title } = props
  const { colors } = useTheme()
  const { getAttachmentStorage } = useTool()

  const [totalSize, setTotalSize] = useState(0)

  const usagePercentage = convertBytesToGB(totalSize)
  const backgroundColor =
    usagePercentage >= 0.8 ? (usagePercentage >= 1 ? colors.error : colors.warning) : colors.primary

  const counting = async () => {
    const count = await getAttachmentStorage()

    setTotalSize(count)
  }
  useEffect(() => {
    counting()
  }, [])

  return (
    <View style={{ width: "100%", marginVertical: 4 }}>
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

        <Text text={`${usagePercentage.toFixed(4)}/1 GB`} />
      </View>

      <ProgressBar
        style={{
          height: 6,
          borderRadius: 4,
          backgroundColor: colors.block,
        }}
        progressColor={backgroundColor}
        progress={Math.min(usagePercentage * 100, 100)}
      />
    </View>
  )
}

export const PlanUsage = () => {
  const { colors } = useTheme()
  const navigation = useNavigation() as any
  const { user } = useStores()
  const { translate } = useAppLocale()

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
        <Text preset="bold" text={translate("manage_plan.usage.title")} />

        {items.map((e, index) => (
          <ItemStorage
            key={index}
            cipherType={e.cipherType}
            limits={e.limits}
            title={e.title}
            isUnlimited={!isFreeAccount}
          />
        ))}
        {!isFreeAccount && <AttachmentStorage title={translate("file_attachment.title")} />}
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
