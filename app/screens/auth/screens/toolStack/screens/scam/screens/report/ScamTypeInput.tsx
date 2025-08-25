import { Icon, PressableScale, Text } from "@/components/cores"
import { NewActionSheet, NewActionSheetItem } from "@/components/utils"
import { ScamPhoneType } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useState } from "react"
import { Keyboard, StyleSheet, ViewStyle } from "react-native"

interface Props {
  scamType: ScamPhoneType
  setScamType: (type: ScamPhoneType) => void
}

export const ScamTypeInput = ({ scamType, setScamType }: Props) => {
  const { themed } = useAppTheme()
  const [openActions, setOpenActions] = useState(false)

  return (
    <>
      <PressableScale
        style={themed($container)}
        onPress={() => {
          Keyboard.dismiss()
          setOpenActions(true)
        }}
      >
        <Text
          tx={`scam:report.type.${scamType}`}
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.text}
        />
        <Icon icon="caret-down" size={20} />
      </PressableScale>
      <NewActionSheet isOpen={openActions} onClose={() => setOpenActions(false)}>
        {Object.values(ScamPhoneType).map((type) => (
          <NewActionSheetItem
            key={type}
            tx={`scam:report.type.${type}`}
            onPress={() => {
              setOpenActions(false)
              setScamType(type)
            }}
            icon={scamType === type ? "check" : undefined}
          />
        ))}
      </NewActionSheet>
    </>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  paddingHorizontal: 16,
})

const styles = StyleSheet.create({
  text: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
})
