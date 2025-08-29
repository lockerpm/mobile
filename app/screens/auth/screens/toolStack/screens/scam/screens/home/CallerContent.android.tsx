import {
  Button,
  Text,
  Switch,
  BottomModal,
  PressableScale,
  PressableIcon,
} from "app/components/cores"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, AppState, Dimensions, StyleSheet, View } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import { useCallerID, useCallerIDData } from "@/services/callerID/useCallerID.android"
import { observer } from "mobx-react-lite"
import { MenuItemContainer } from "@/components/utils"
import { Bar } from "react-native-progress"

const propsWidth = Dimensions.get("window").width - 108

const EnablePermissionView = observer(() => {
  const { updateData, downloadProgress, isUpdateLocalDatabase } = useCallerIDData()
  const {
    theme: { colors },
  } = useAppTheme()

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

interface GuideProps {
  isOpen: boolean
  isEnabledOverlayPermission: boolean
  onClose: () => void
  btnAction: () => void
}

const GuideViewModal = ({ isOpen, isEnabledOverlayPermission, onClose, btnAction }: GuideProps) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} style={{ backgroundColor: colors.block }}>
      {!isEnabledOverlayPermission && (
        <View>
          <Text weight="semiBold" tx={"scam:home.android.enable.title"} style={styles.mt12} />
          <Text tx={"scam:home.android.enable.first"} style={styles.mt12} />
          <Text tx={"scam:home.android.enable.second"} style={styles.mt12} />
          <Text tx={"scam:home.android.enable.third"} style={styles.mt12} />
          <View style={styles.mt12}>
            <Button tx={"scam:home.android.enable.btn"} onPress={btnAction} style={styles.mt12} />
          </View>
        </View>
      )}
      {isEnabledOverlayPermission && (
        <View>
          <Text weight="semiBold" tx={"scam:home.android.disable.title"} style={styles.mt12} />
          <Text tx={"scam:home.android.disable.label"} style={styles.mt12} />
          <View style={styles.mt12}>
            <Button tx={"scam:home.android.disable.btn"} onPress={btnAction} style={styles.mt12} />
          </View>
        </View>
      )}
    </BottomModal>
  )
}

export const CallerContent = observer(() => {
  const {
    isEnabledOverlayPermission,
    requestLiveCallPermission,
    checkEnabledOverlayPermission,
    openOverlayPermissionSettings,
  } = useCallerID()

  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  const [isGuideOpen, setIsGuideOpen] = useState(false)

  useEffect(() => {
    checkEnabledOverlayPermission()
  }, [appStateVisible, checkEnabledOverlayPermission])

  useEffect(() => {
    AppState.addEventListener("change", (nextAppState) => {
      setAppStateVisible(nextAppState)
      setIsGuideOpen(false)
    })
  }, [])

  const onPress = () => {
    setIsGuideOpen(true)
  }

  return (
    <MenuItemContainer>
      <PressableScale onPress={onPress} style={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowShrink}>
            <Text tx="scam:home.android.title" />
          </View>
          <Switch value={isEnabledOverlayPermission} onPress={onPress} />
        </View>
        <Text preset="label" size="sm" tx="scam:home.android.desc" style={styles.mt4} />
        <GuideViewModal
          isEnabledOverlayPermission={isEnabledOverlayPermission}
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          btnAction={
            isEnabledOverlayPermission ? openOverlayPermissionSettings : requestLiveCallPermission
          }
        />
      </PressableScale>
      {isEnabledOverlayPermission ? <EnablePermissionView /> : null}
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
