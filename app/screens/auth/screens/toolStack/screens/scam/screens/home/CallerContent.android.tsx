import { Text, Switch, PressableScale, PressableIcon } from "app/components/cores"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  AppState,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import { useCallerID, useCallerIDData } from "@/services/callerID/useCallerID.android"
import { observer } from "mobx-react-lite"
import { MenuItemContainer } from "@/components/utils"
import { Bar } from "react-native-progress"
import { useStores } from "@/models"
import { useAppLocale } from "@/i18n"

const propsWidth = Dimensions.get("window").width - 108

const EnablePermissionView = observer(() => {
  const { updateData, downloadProgress, isUpdateLocalDatabase } = useCallerIDData()
  const { toolStore } = useStores()
  const {
    theme: { colors },
  } = useAppTheme()

  useEffect(() => {
    if (!toolStore.lastSyncCursor) {
      updateData()
    }
  }, [toolStore.lastSyncCursor, updateData])

  const progress = Math.floor(downloadProgress * 100)

  return (
    <View style={styles.content}>
      <PressableScale
        style={styles.updateContainer}
        disabled={isUpdateLocalDatabase}
        onPress={updateData}
      >
        <Text
          preset="label"
          size="sm"
          tx={"scam:home.android.update"}
          style={styles.updateContent}
        />
        {!isUpdateLocalDatabase && (
          <PressableIcon
            icon="arrow-clockwise"
            disabled={isUpdateLocalDatabase}
            onPress={updateData}
            color={colors.primary}
          />
        )}
        {isUpdateLocalDatabase && <ActivityIndicator size={28} color={colors.primary} />}
      </PressableScale>
      {isUpdateLocalDatabase && (
        <View style={styles.updateLoading}>
          <Bar
            height={8}
            width={propsWidth}
            borderRadius={12}
            unfilledColor={colors.block}
            borderColor="transparent"
            color={colors.primary}
            progress={downloadProgress}
          />

          <Text size="sm" text={progress + "%"} style={styles.ml12} />
        </View>
      )}
    </View>
  )
})

export const CallerContent = observer(() => {
  const { translate } = useAppLocale()
  const { isEnabledCallScreeningPermission, requestCallScreeningApp, isCallScreeningEnabled } =
    useCallerID()

  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  useEffect(() => {
    isCallScreeningEnabled()
  }, [appStateVisible, isCallScreeningEnabled])

  useEffect(() => {
    AppState.addEventListener("change", (nextAppState) => {
      setAppStateVisible(nextAppState)
    })
  }, [])

  const enableCallScreeningApp = () => {
    if (typeof Platform.Version === "number" && Platform.Version < 29) {
      Alert.alert(
        translate("scam:home.android.alertTitle"),
        translate("scam:home.android.alertLabel"),
        [
          {
            text: translate("common:cancel"),
            style: "cancel",
          },
        ]
      )
      return
    }
    requestCallScreeningApp()
  }

  return (
    <MenuItemContainer>
      <PressableScale onPress={enableCallScreeningApp} style={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowShrink}>
            <Text tx="scam:home.android.title" />
          </View>
          <Switch value={isEnabledCallScreeningPermission} onPress={enableCallScreeningApp} />
        </View>
        <Text preset="label" size="sm" tx="scam:home.android.desc" style={styles.mt4} />
      </PressableScale>
      {isEnabledCallScreeningPermission ? <EnablePermissionView /> : null}
    </MenuItemContainer>
  )
})

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingVertical: 12,
  },
  ml12: {
    marginLeft: 12,
  },
  mt12: {
    marginTop: 12,
  },
  mt4: {
    marginTop: 4,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  rowShrink: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  updateContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  updateContent: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  updateLoading: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 8,
  },
})
