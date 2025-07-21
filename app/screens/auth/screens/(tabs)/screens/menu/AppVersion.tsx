import { View, StyleSheet } from "react-native"
import { Text } from "@/components/cores"
import { getVersion } from "react-native-device-info"

export const AppVersion = () => {
  const appVersion = `${getVersion()}`
  return (
    <View>
      <View style={styles.locker}>
        <Text preset="label" tx="menu:product_of" />
        <Text preset="label" weight="semiBold" text={"CyStack"} />
      </View>
      <Text preset="label" style={styles.appVersion}>
        Locker - {appVersion}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  appVersion: {
    marginVertical: 8,
    textAlign: "center",
  },

  locker: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
})
