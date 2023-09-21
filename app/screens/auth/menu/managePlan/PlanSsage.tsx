import React, { useEffect, useState } from "react"
import { View, ViewStyle, StyleProp } from "react-native"
import { Text, Button } from "app/components-v2/cores"
import { useNavigation } from "@react-navigation/native"
import ProgressBar from "react-native-ui-lib/progressBar"
import { CipherType } from "core/enums"
import { useTheme } from "app/services/context"
import { useTool } from "app/services/hook"
import { useStores } from "app/models"
import { translate } from "app/i18n"
import { FREE_PLAN_LIMIT } from "app/static/constants"


interface PlanItemUsage {
  cipherType: CipherType,
  title: string,
  limits: number,
}

interface PlanStorageProps {
  style?: StyleProp<ViewStyle>
  isUnlimited?: boolean
  cipherType: CipherType,
  limits: number,
  title: string,
}


const ItemStorage = (props: PlanStorageProps) => {
  const { cipherType, style, limits, title, isUnlimited } = props
  const { colors } = useTheme()
  const { getCipherCount } = useTool()


  const [cipherCount, setCipherCount] = useState(0)

  const usagePercentage = cipherCount / limits * 100
  const backgroundColor = usagePercentage >= 80 ? (usagePercentage >= 100 ? colors.error : colors.warning) : colors.primary

  useEffect(() => {
    const counting = async () => {
      const count = await getCipherCount(cipherType)

      setCipherCount(count)
    }
    counting()
  }, [])

  return (
    <View style={[{ width: '100%', marginVertical: 4 }, style]}>
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
      }}>
        <Text text={title} />
        <Text> {cipherCount}/{isUnlimited ? "∞" : limits}</Text>
      </View>

      {
        !isUnlimited && <ProgressBar
          height={6}
          containerStyle={{
            borderRadius: 4
          }}
          progressBackgroundColor={colors.block}
          backgroundColor={backgroundColor}
          // @ts-ignore
          progress={isUnlimited ? 0 : (cipherCount / limits * 100)}
        />
      }
    </View>
  )
}

export const PlanUsage = () => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const { user } = useStores()

  const isFreeAccount = user.isFreePlan
  const items: PlanItemUsage[] = [
    {
      cipherType: CipherType.Login,
      title: translate('manage_plan.usage.login'),
      limits: FREE_PLAN_LIMIT.LOGIN,
    },
    {
      cipherType: CipherType.Card,
      title: translate('manage_plan.usage.card'),
      limits: FREE_PLAN_LIMIT.PAYMENT_CARD,
    },
    {
      cipherType: CipherType.Identity,
      title: translate('manage_plan.usage.identity'),
      limits: FREE_PLAN_LIMIT.IDENTITY,
    },
    {
      cipherType: CipherType.SecureNote,
      title: translate('manage_plan.usage.note'),
      limits: FREE_PLAN_LIMIT.NOTE,
    },
    {
      cipherType: CipherType.CryptoWallet,
      title: translate('manage_plan.usage.crypto'),
      limits: FREE_PLAN_LIMIT.CRYPTO,
    },
  ]
  // -------------------- RENDER ----------------------

  return (
    <View style={{ backgroundColor: colors.background, marginBottom: 10, padding: 16 }}>

      <View style={{
        borderRadius: 10,
        padding: 16,
        backgroundColor: colors.block
      }}>
        {
          isFreeAccount && <Text preset="bold" text={"Plan Usage"} style={{ marginBottom: 8 }} />
        }
        {
          !isFreeAccount &&
          <View style={{ flex: 1, flexDirection: "row", marginBottom: 8 }}>
            <Text preset="default" text={"Plan Usage"} />
            <View style={{
              marginLeft: 8,
              paddingHorizontal: 10,
              paddingVertical: 3,
              backgroundColor: colors.primary,
              borderRadius: 3
            }}>
              <Text
                preset="bold"
                text={user.pwd_user_type === "enterprise" ? translate('common.enterprise') : user.plan?.name.toUpperCase()}
                size="base"
                style={{
                  color: colors.background,
                }}
              />
            </View>
          </View>
        }

        {
          items.map(
            e => <ItemStorage key={e.cipherType} cipherType={e.cipherType} limits={e.limits} title={e.title} isUnlimited={!isFreeAccount} />
          )
        }
      </View>
      {isFreeAccount && <Button
        onPress={() => { navigation.navigate("payment") }}
        text={translate('manage_plan.free.button')}
        style={{ marginTop: 12 }}
      />}
    </View>
  )
}
