import { useAppTheme } from "@/utils/useAppTheme"
import moment from "moment"
import { Dimensions, View, StyleSheet, ViewStyle } from "react-native"
import { Text } from "app/components/cores"
import { ThemedStyle } from "@/theme"

interface QuickSharesInfoProps {
  emails: string[]
  expirationDate: number
}

const width = Dimensions.get("window").width

export const QuickSharesInfo = ({
  // id,
  emails,
  expirationDate,
}: QuickSharesInfoProps) => {
  const { themed } = useAppTheme()
  const expried = moment.unix(expirationDate / 1000).format("Do MMM YYYY, h:mm:ss A")

  return (
    <View
      style={{
        width: width - 32,
      }}
    >
      <Text tx="quick_shares:receiver" style={styles.receiver} />
      <View style={themed($emailContainer)}>
        {emails.map((e) => (
          <Text key={e} text={e} />
        ))}
        {emails?.length === 0 && <Text tx={"quick_shares:config.anyone"} />}
      </View>

      {!!expirationDate && (
        <Text tx="quick_shares:expired" txOptions={{ time: expried }} style={styles.expired} />
      )}
    </View>
  )
}

const $emailContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  padding: 12,
  backgroundColor: colors.border,
  borderRadius: 8,
})

const styles = StyleSheet.create({
  expired: {
    marginTop: 26,
  },
  receiver: {
    marginBottom: 14,
    marginTop: 24,
  },
})
