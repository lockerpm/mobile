import { useEffect, useState } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { Text } from "app/components/cores"
import { useTool } from "app/services/hook"
import { useAppTheme } from "@/utils/useAppTheme"
import { Bar } from "react-native-progress"
import { TxKeyPath } from "@/i18n"

const barWidth = Dimensions.get("window").width - 64
const convertBytesToGB = (bytes: number) => {
  return bytes / 1024 / 1024 / 1024
}

export const AttachmentStorage = ({ tx }: { tx: TxKeyPath }) => {
  const {
    theme: { colors },
  } = useAppTheme()
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
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text tx={tx} style={styles.title} />

        <Text text={`${usagePercentage.toFixed(4)}/1 GB`} />
      </View>

      <Bar
        height={8}
        width={barWidth}
        borderRadius={4}
        unfilledColor={colors.block}
        borderColor="transparent"
        color={backgroundColor}
        progress={usagePercentage}
      />
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
