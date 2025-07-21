import { useState } from "react"
import { NewActionSheet } from "app/components/utils/actionSheet/ActionSheet"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Icon, Text } from "app/components/cores"
import { NewActionSheetItem } from "app/components/utils"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  title: string
  setTitle: (val: string) => void
}

export const SetIDTitle = ({ title, setTitle }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()

  const [isSelect, setIsSelect] = useState(false)

  const options = [
    {
      label: "mr",
      value: "mr",
    },
    {
      label: "mrs",
      value: "mrs",
    },
    {
      label: "ms",
      value: "ms",
    },
    {
      label: "dr",
      value: "dr",
    },
  ]

  return (
    <View>
      <TouchableOpacity onPress={() => setIsSelect(true)}>
        <View style={styles.container}>
          <View style={styles.row}>
            <Text preset="bold" text={"Title: "} />
            {!!title && <Text preset="bold" text={title} />}
          </View>
          <Icon icon="caret-right" size={20} color={colors.label} />
        </View>
      </TouchableOpacity>

      <NewActionSheet
        isOpen={isSelect}
        onClose={() => setIsSelect(false)}
        closeTx={"common:cancel"}
      >
        {options.map((item, index) => (
          <NewActionSheetItem
            icon={item.value === title ? "check" : undefined}
            iconColor={colors.success}
            key={index}
            text={item.label}
            onPress={() => {
              setTitle(item.value)
              setIsSelect(false)
            }}
          />
        ))}
      </NewActionSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
