import { StyleSheet, View } from "react-native"
import { Icon, Text } from "app/components/cores"
import React from "react"
import { useTheme } from "app/services/context"
import moment from "moment"

interface Props {
  number: string
  date: number
  duration: number
  type: number
  name: string
  label?: string
  id: string
  repeat?: number
}
export const HistoryCallLogItem = (item: Props) => {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.secondaryText,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          {item.name && <Text text={item.name[0]} size="large" color={colors.background} />}
          {!item.name && <Icon icon="user" size={20} color={colors.background} />}
        </View>
        <View style={styles.contentText}>
          {item.name && <Text text={item.name} />}
          <View style={styles.number}>
            <Text text={item.number} />
            <Text text={moment(item.date).format("HH:mm DD, MM,YY")} />
          </View>
        </View>
      </View>
      <Text text={"Locker: " + item.label} color={colors.error} />
      <View
        style={[
          styles.border,
          {
            backgroundColor: colors.border,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  border: {
    flexGrow: 1,
    flexShrink: 1,
    height: 1,
    marginLeft: 36,
    marginTop: 12,
    width: "100%",
  },
  container: {
    paddingBottom: 0,
    paddingTop: 12,
  },
  contentContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  contentText: {
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: "center",
    marginRight: 12,
  },
  number: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
})
