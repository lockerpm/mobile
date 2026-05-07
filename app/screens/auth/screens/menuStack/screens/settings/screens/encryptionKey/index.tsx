import { FC, useEffect, useRef, useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { CommonActions } from "@react-navigation/native"

import { Screen, Header, Text, Button, TextInput } from "app/components/cores"
import { SettingsScreenProps } from "app/navigators"

import { TxKeyPath } from "@/i18n"
import { useCoreService } from "@/services/coreService"
import { useAuthentication } from "@/services/hook"
import { MPEncodeConfig } from "@/static/types/user.types"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { MasterPasswordEncodeConfig } from "./MasterPasswordEncodeConfig"
import { useMasterPasswordCipher } from "./useMasterPasswordCipher"

export const EncryptionKeyScreen: FC<SettingsScreenProps<"encryptionKey">> = ({ navigation }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { userService } = useCoreService()
  const { masterPassword } = useMasterPasswordCipher()
  const { changeMasterPassword } = useAuthentication()

  const initEncodeConfig = useRef<Required<MPEncodeConfig>>({
    kdf: userService.getKdf(),
    kdf_iterations: userService.getKdfIterations(),
    kdf_memory: userService.getKdfMemory(),
    kdf_parallelism: userService.getKdfParallelism(),
    kdf_version: userService.getKdfVersion(),
  })
  // -------------- PARAMS --------------
  const [encodeConfig, setEncodeConfig] = useState<Required<MPEncodeConfig>>(
    initEncodeConfig.current
  )
  const [isLoading, setIsLoading] = useState(false)
  const [current, setCurrent] = useState("")

  const isUserChangeConfig = Object.keys(encodeConfig).some(
    (key) =>
      encodeConfig[key as keyof MPEncodeConfig] !==
      initEncodeConfig.current[key as keyof MPEncodeConfig]
  )

  // -------------- METHOD --------------

  const handleSave = async () => {
    setIsLoading(true)
    const res = await changeMasterPassword(current, current, "", encodeConfig)
    if (res.kind === "ok") {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "init" }],
        })
      )
    }
    setIsLoading(false)
  }

  // -------------- EFFECT --------------

  useEffect(() => {
    if (masterPassword?.login.password) {
      setCurrent(masterPassword.login.password)
    }
  }, [masterPassword])

  // -------------- RENDER --------------
  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleTx={"encryption_key:title"}
        />
      }
      footer={
        <Button
          loading={isLoading}
          disabled={isLoading || !isUserChangeConfig}
          onPress={handleSave}
          tx={"common:save"}
          style={styles.save}
        />
      }
      backgroundColor={colors.block}
      keyboardOffset={16}
      contentContainerStyle={styles.screen}
    >
      <View style={themed($container)}>
        <DescItem tx={"encryption_key:desc.first"} />

        <DescItem tx={"encryption_key:desc.second"} />
      </View>

      {!masterPassword?.login.password && (
        <View style={themed($container)}>
          <TextInput
            isPassword
            placeholderTx={"change_master_pass:current"}
            value={current}
            onChangeText={setCurrent}
          />
        </View>
      )}
      <MasterPasswordEncodeConfig encodeConfig={encodeConfig} setEncodeConfig={setEncodeConfig} />
    </Screen>
  )
}

const DescItem = ({ tx }: { tx: TxKeyPath }) => {
  const { themed } = useAppTheme()
  return (
    <View style={styles.row}>
      <View style={themed($dot)} />
      <Text tx={tx} size="sm" />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: colors.background,
  borderRadius: 12,
  gap: 16,
})

const $dot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 6,
  height: 6,
  borderRadius: 3,
  marginTop: 9,
  backgroundColor: colors.text,
})

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  save: {
    marginHorizontal: 20,
  },
  screen: {
    gap: 16,
    marginTop: 16,
    paddingHorizontal: 16,
  },
})
