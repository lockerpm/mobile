import { useEffect, useState } from "react"
import { View, ViewStyle, StyleProp, StyleSheet, Dimensions } from "react-native"
import { Text } from "app/components/cores"
import { CipherType } from "core/enums"
import { useTool } from "app/services/hook"
import { useAppTheme } from "@/utils/useAppTheme"
import { Bar } from "react-native-progress"
import { TxKeyPath } from "@/i18n"

interface PlanStorageProps {
  style?: StyleProp<ViewStyle>
  isUnlimited?: boolean
  cipherType: CipherType[]
  limits: number
  tx: TxKeyPath
}

const barWidth = Dimensions.get("window").width - 64

export const CipherStorage = (props: PlanStorageProps) => {
  const { cipherType, style, limits, tx, isUnlimited } = props
  const {
    theme: { colors },
  } = useAppTheme()
  const { getCipherCount } = useTool()

  const [cipherCount, setCipherCount] = useState(0)

  const usagePercentage = cipherCount / limits
  const backgroundColor =
    usagePercentage >= 0.8 ? (usagePercentage >= 1 ? colors.error : colors.warning) : colors.primary

  useEffect(() => {
    const counting = async () => {
      const count = await getCipherCount(cipherType)

      setCipherCount(count)
    }
    counting()
  }, [])

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        <Text tx={tx} style={styles.title} />
        <Text
          text={
            isUnlimited ? cipherCount.toString() : `${cipherCount}/${isUnlimited ? "∞" : limits}`
          }
        />
      </View>

      {!isUnlimited && (
        <Bar
          height={8}
          width={barWidth}
          borderRadius={4}
          unfilledColor={colors.block}
          borderColor="transparent"
          color={backgroundColor}
          progress={usagePercentage}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: "100%",
  },
  title: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
})
