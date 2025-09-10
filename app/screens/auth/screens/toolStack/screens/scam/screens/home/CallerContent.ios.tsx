import { PressableScale, Text, Switch, Button } from "@/components/cores"
import { MenuItemContainer } from "@/components/utils"
import Config from "@/config"
import { useAppLocale } from "@/i18n"
import { useCallerID } from "@/services/callerID/useCallerID.ios"
import { useState } from "react"
import { Alert, Platform, StyleSheet, View } from "react-native"

export const CallerContent = () => {
  const { isExtensionEnabled, openSettings, refreshService, resetService } = useCallerID()
  const { translate } = useAppLocale()
  const [isTestRefreshing, setIsTestRefreshing] = useState(false)

  const enableCallerIdLookup = () => {
    if (typeof Platform.Version === "string" && Platform.Version < "18.2") {
      Alert.alert(translate("scam:home.ios.title"), translate("scam:home.ios.label"), [
        {
          text: translate("common:cancel"),
          style: "cancel",
        },
      ])
      return
    }
    openSettings()
  }

  const testRefreshService = async () => {
    setIsTestRefreshing(true)
    await refreshService()
    setIsTestRefreshing(false)
  }

  return (
    <MenuItemContainer>
      <PressableScale style={styles.itemContainer2} onPress={enableCallerIdLookup}>
        <View style={styles.itemContent2}>
          <Text tx={"scam:home.getWarning"} style={styles.itemText} />
          <Text preset="label" tx={"scam:home.getWarningDesc"} size="xs" style={styles.itemLabel} />
        </View>

        <Switch value={isExtensionEnabled} onPress={enableCallerIdLookup} />
      </PressableScale>
      {__DEV__ && !Config.IS_PROD && (
        <Button
          loading={isTestRefreshing}
          text={"Refresh Ios Extension"}
          onPress={testRefreshService}
          style={styles.testRefreshButton}
        />
      )}
      {__DEV__ && !Config.IS_PROD && (
        <Button
          loading={isTestRefreshing}
          text={"Reset"}
          onPress={resetService}
          style={styles.testRefreshButton}
        />
      )}
    </MenuItemContainer>
  )
}

const styles = StyleSheet.create({
  itemContainer2: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemContent2: {
    flex: 1,
    paddingRight: 12,
  },
  itemLabel: {
    marginTop: 4,
  },
  itemText: {
    flexGrow: 1,
    flexShrink: 1,
  },
  testRefreshButton: {
    marginHorizontal: 16,
    marginTop: 12,
  },
})
