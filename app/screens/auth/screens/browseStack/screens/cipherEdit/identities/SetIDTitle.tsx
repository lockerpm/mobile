import React, { useState } from "react"
import { NewActionSheet } from "app/components/utils/actionSheet/ActionSheet"
import { TouchableOpacity, View } from "react-native"
import { Icon, Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { NewActionSheetItem } from "app/components/utils"

interface Props {
  title: string
  setTitle: (val: string) => void
}

export const SetIDTitle = ({ title, setTitle }: Props) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()

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
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text preset="bold" text={"Title: "} />
            {!!title && <Text preset="bold" text={title} />}
          </View>
          <Icon icon="caret-right" size={20} color={colors.secondaryText} />
        </View>
      </TouchableOpacity>

      <NewActionSheet
        isOpen={isSelect}
        onClose={() => setIsSelect(false)}
        closeText={translate("common.cancel")}
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
