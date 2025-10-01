import { ScamMyReportData } from "@/static/types"
import { StyleSheet, View, Image, ViewStyle } from "react-native"
import { Icon, Text } from "@/components/cores"
import { formatDate } from "@/utils/formatDate"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  item: ScamMyReportData
}

export const ListItem = ({ item }: Props) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($userReport)}>
      {!item.user?.full_name && (
        <View style={styles.row}>
          <Icon icon="user" size={16} containerStyle={styles.mr8} />
          <Text weight="semiBold" tx="scam:lookupResult.user.title" />
          <Text tx="scam:lookupResult.user.label" />
        </View>
      )}
      {!!item.user?.full_name && (
        <View style={styles.row}>
          <Image style={styles.avatar} source={{ uri: item.user?.avatar }} />
          <Text weight="semiBold" text={item.user?.full_name} />
          <Text tx="scam:lookupResult.user.label" />
        </View>
      )}
      <View style={styles.row2}>
        <View style={themed($report)}>
          <Text
            size="xs"
            color={"#B54708"}
            // @ts-ignore
            tx={"scam:report.type." + item.phishing_type}
          />
        </View>
        <Text size="xs" preset="label" text={formatDate(item.created_time * 1000, "dd/MM/yyyy")} />
      </View>

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

const $report: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 16,
  borderWidth: 1,
  padding: 2,
  paddingHorizontal: 8,
  borderColor: "#FEDF89",
  backgroundColor: "#FFFAEB",
  marginRight: 12,
  flexShrink: 1,
  flexGrow: 1,
})

const $description: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 16,
  borderWidth: 1,
  padding: 4,
  paddingHorizontal: 8,
  borderColor: colors.border,
  backgroundColor: colors.background,
  marginRight: 12,
  flexShrink: 1,
  flexGrow: 1,
  marginTop: 12,
})

const $userReport: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.block,
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
})

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 9,
    height: 18,
    marginRight: 8,
    width: 18,
  },
  mr8: {
    marginRight: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  row2: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 12,
  },
})
