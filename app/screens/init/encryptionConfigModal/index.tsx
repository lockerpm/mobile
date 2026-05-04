import { FC, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"

import {
  ModalBackdrop,
  BottomModalContainer,
  Text,
  Button,
  Icon,
  PressableIcon,
} from "app/components/cores"
import { AppScreenProps } from "app/navigators"
import { debounce } from "app/utils/utils"

import { MasterPasswordEncodeConfig } from "@/components/utils/mpEncodeConfig"
import { MPEncodeConfig } from "@/static/types"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

export const EncryptionConfigModal: FC<AppScreenProps<"encryptionConfigModal">> = ({
  navigation,
  route: {
    params: { data },
  },
}) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const onClose = debounce(navigation.goBack, 400)

  const initEncodeConfig = useRef<Required<MPEncodeConfig>>({
    kdf: data.kdf,
    kdf_iterations: data.kdf_iterations ?? 3,
    kdf_memory: data.kdf_memory ?? 64,
    kdf_parallelism: data.kdf_parallelism ?? 4,
    kdf_version: data.kdf_version ?? 0,
  })
  // -------------- PARAMS --------------

  const [encodeConfig, setEncodeConfig] = useState<Required<MPEncodeConfig>>(
    initEncodeConfig.current
  )

  const isUserChangeConfig = Object.keys(encodeConfig).some(
    (key) =>
      encodeConfig[key as keyof MPEncodeConfig] !==
      initEncodeConfig.current[key as keyof MPEncodeConfig]
  )

  const handleSave = () => {
    EventBus.emit(AppEventType.SELECT_ENCRYPTION_CONFIG, encodeConfig)
    onClose()
  }

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />
      <BottomModalContainer>
        <View style={styles.header}>
          <PressableIcon icon="x" onPress={onClose} />
        </View>
        <MasterPasswordEncodeConfig encodeConfig={encodeConfig} setEncodeConfig={setEncodeConfig} />

        <View style={styles.infoContainer}>
          <Icon icon={"info"} size={16} color={colors.label} containerStyle={styles.icon} />
          <Text tx={"encryption_key:select"} preset="label" size="xs" style={styles.text} />
        </View>
        <Button
          disabled={!isUserChangeConfig}
          onPress={handleSave}
          tx={"common:save"}
          style={styles.button}
        />
      </BottomModalContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 16,
    marginTop: 64,
  },
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  header: {
    alignItems: "flex-end",
    marginHorizontal: 16,
  },
  icon: {
    marginTop: 9,
  },
  infoContainer: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
