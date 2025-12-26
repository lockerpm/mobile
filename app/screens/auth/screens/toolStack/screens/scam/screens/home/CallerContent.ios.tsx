import { Alert, Platform, StyleSheet, View } from "react-native"

import { PressableScale, Text, Switch } from "@/components/cores"
import { MenuItemContainer } from "@/components/utils"
import { useAppLocale } from "@/i18n"
import { useCallerID } from "@/services/callerID/useCallerID.ios"

export const CallerContent = () => {
  const { isExtensionEnabled, openSettings } = useCallerID()
  const { translate } = useAppLocale()

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

  return (
    <MenuItemContainer>
      <PressableScale style={styles.itemContainer2} onPress={enableCallerIdLookup}>
        <View style={styles.itemContent2}>
          <Text tx={"scam:home.getWarning"} style={styles.itemText} />
          <Text preset="label" tx={"scam:home.getWarningDesc"} size="xs" style={styles.itemLabel} />
        </View>

        <Switch value={isExtensionEnabled} onPress={enableCallerIdLookup} />
      </PressableScale>
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
})
