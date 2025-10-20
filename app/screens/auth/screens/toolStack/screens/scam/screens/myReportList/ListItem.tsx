import { ScamMyReportData } from "@/static/types"
import { ActivityIndicator, StyleSheet, View, ViewStyle } from "react-native"
import { PressableIcon, Text } from "@/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { formatDate } from "@/utils/formatDate"
import { useState } from "react"
import { ThemedStyle } from "@/theme"

interface Props {
  item: ScamMyReportData
  onDelete: (id: string) => Promise<void>
}

export const ListItem = ({ item, onDelete }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(item.id)
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text size="sm" text={item.value} style={styles.phone} color={colors.error} />
        {!isDeleting ? (
          <PressableIcon icon="trash" onPress={handleDelete} color={colors.error} />
        ) : (
          <ActivityIndicator color={colors.error} size={"small"} />
        )}
      </View>
      <View style={styles.row}>
        <Text size="sm" preset="label" text={formatDate(item.created_time * 1000)} />
      </View>

      <Text size="sm" weight="semiBold" tx="scam:myReportList.scanType" />
      <Text
        size="sm"
        // @ts-ignore
        tx={"scam:report.type." + item.phishing_type}
      />
      {!!item.description && (
        <View>
          <View style={themed($description)}>
            <Text size="xs">{item.description}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

const $description: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 16,
  borderWidth: 1,
  padding: 4,
  paddingHorizontal: 8,
  borderColor: colors.border,
  backgroundColor: colors.block,
  marginRight: 12,
  flexShrink: 1,
  flexGrow: 1,
  marginTop: 12,
})

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  phone: {
    flexGrow: 1,
    flexShrink: 1,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
