import { ScamMyReportData } from "@/static/types"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { PressableIcon, Text } from "@/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { formatDate } from "@/utils/formatDate"
import { useAppLocale } from "@/i18n"
import { useState } from "react"

interface Props {
  item: ScamMyReportData
  onDelete: (id: string) => Promise<void>
}

export const ListItem = ({ item, onDelete }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

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
        {item.is_anonymous && (
          <Text size="sm" preset="label" text={" - " + translate("scam:report.anonymos")} />
        )}
      </View>

      <Text size="sm" weight="semiBold" tx="scam:myReportList.scanType" />
      <Text size="sm">{item.description}</Text>
    </View>
  )
}

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
