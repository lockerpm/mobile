import { StyleSheet, View, ViewStyle } from "react-native"
import {
  Button,
  ImageIconTypes,
  ImageIcon,
  Text,
  Logo,
  PressableScale,
  BottomModal,
  Checkbox,
  TextProps,
} from "../../cores"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useState } from "react"

interface Props {
  /**
   * Sheet title header
   */
  titleTx: TextProps["tx"]
  /**
   * Description
   */
  labelTx: TextProps["tx"]
  /**
   * is sheet visible
   */
  isOpen: boolean
  /**
   * Callback function when bottom sheet closed
   */
  onClose: () => void
  /**
   * Is save credentials in keychain
   */
  action: (isIcloudSelected: boolean) => void
}

export const IosPasswordlessOptions = ({ titleTx, labelTx, isOpen, onClose, action }: Props) => {
  const [isIcloudSelected, setIsIcloudSelected] = useState(true)

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} tx={titleTx}>
      <Logo preset="app-logo-secondary" style={styles.logo} />
      <Text tx={labelTx} style={styles.centerText} />

      <Options
        titleTx={"passkey:sign_up.keychain.title"}
        labelTx={"passkey:sign_up.keychain.label"}
        icon="keychain"
        isSelect={isIcloudSelected}
        action={() => {
          setIsIcloudSelected(true)
        }}
      />
      <Options
        titleTx={"passkey:sign_up.security_key.title"}
        labelTx={"passkey:sign_up.security_key.label"}
        icon="security-key"
        isSelect={!isIcloudSelected}
        action={() => {
          setIsIcloudSelected(false)
        }}
      />

      <Button
        tx={"common:continue"}
        style={styles.button}
        onPress={() => action(isIcloudSelected)}
      />
    </BottomModal>
  )
}

interface OptionsProps {
  isSelect: boolean
  action: () => void
  titleTx: TextProps["tx"]
  labelTx: TextProps["tx"]
  icon: ImageIconTypes
}

const Options = ({ titleTx, labelTx, icon, isSelect, action }: OptionsProps) => {
  const { themed } = useAppTheme()
  return (
    <PressableScale onPress={action}>
      <View style={themed($optionContainer)}>
        <View style={styles.optionContent}>
          <ImageIcon icon={icon} size={32} />
          <View style={styles.optionText}>
            <Text tx={titleTx} />
            <Text preset="label" tx={labelTx} size="sm" />
          </View>
        </View>

        <Checkbox value={isSelect} />
      </View>
    </PressableScale>
  )
}

const $optionContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginTop: 12,
  padding: 16,
  paddingVertical: 8,
  backgroundColor: colors.block,
  borderRadius: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    marginTop: 16,
    width: 120,
  },
  centerText: {
    textAlign: "center",
  },
  logo: {
    alignSelf: "center",
    height: 60,
    marginBottom: 16,
    width: 60,
  },
  optionContent: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
  optionText: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
})
