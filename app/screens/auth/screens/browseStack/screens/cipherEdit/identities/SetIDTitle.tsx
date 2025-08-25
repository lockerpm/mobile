import { useState } from "react"
import { NewActionSheet } from "app/components/utils/actionSheet/ActionSheet"
import { View } from "react-native"
import { Text } from "app/components/cores"
import { NewActionSheetItem } from "app/components/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { CipherEditActionField } from "@/components/ciphers"

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
      <CipherEditActionField label="Title" onPress={() => setIsSelect(true)}>
        {!!title && <Text preset="bold" text={title} />}
      </CipherEditActionField>

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
