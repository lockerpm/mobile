/* eslint-disable react-native/no-inline-styles */
import { useState } from "react"
import { View, ViewStyle, StyleSheet, TextStyle } from "react-native"
import { UriItem } from "./UriItem"
import { ThemedStyle, typography } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { Icon, PressableScale, Text } from "@/components/cores"

type DynamicUrisProps = {
  fields: string[]
  editable?: boolean
  setFields?: (fields: string[]) => void
}

export const DynamicUris = ({
  fields,
  setFields = () => {},
  editable = true,
}: DynamicUrisProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const [isFocuseds, setIsFocuseds] = useState<boolean[]>([false])

  const handleAddField = () => {
    setFields([...fields, ""])
    setIsFocuseds([...isFocuseds, false]) // Thêm trạng thái focus cho field mới
  }

  const handleRemoveField = (index: number) => {
    const newFields = [...fields]
    const newIsFocuseds = [...isFocuseds]
    newFields.splice(index, 1)
    newIsFocuseds.splice(index, 1)
    setFields(newFields)
    setIsFocuseds(newIsFocuseds)
  }

  const handleChangeText = (text: string, index: number) => {
    const newFields = [...fields]
    newFields[index] = text
    setFields(newFields)
  }

  const handleChangeFocus = (isFocused: boolean, index: number) => {
    const newIsFocuseds = [...isFocuseds]
    newIsFocuseds[index] = isFocused
    setIsFocuseds(newIsFocuseds)
  }

  const haveAnyUri = fields.length > 0
  const isFocused = isFocuseds.some((focused) => focused)
  const $addBorder: ViewStyle = {
    alignSelf: haveAnyUri ? "flex-end" : "flex-start",
  }

  const $titleAnim: TextStyle = {
    fontSize: 16,
    fontFamily: typography.primary.medium,
    marginBottom: 4,
    zIndex: 2,
    backgroundColor: colors.background,
    paddingHorizontal: 4,
    transform: [
      {
        scale: 0.9,
      },
      {
        translateY: 16,
      },
    ],
    color: colors.text,
    alignSelf: "flex-start",
  }

  return (
    <>
      <View style={styles.container}>
        {haveAnyUri && (
          <>
            <Text style={$titleAnim} tx="common:websites" />
            <View
              style={[
                themed($container),
                {
                  borderColor: isFocused ? colors.primary : colors.border,
                },
              ]}
            >
              {fields.map((field, index) => (
                <View key={index}>
                  {index !== 0 && <View style={themed($divider)} />}

                  <UriItem
                    isDeletable={editable && fields.length > 1}
                    editable={editable}
                    placeholder={`URL ${index + 1}`}
                    value={field}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onFocus={() => handleChangeFocus(true, index)}
                    onBlur={() => handleChangeFocus(false, index)}
                    onRemove={() => handleRemoveField(index)}
                  />
                </View>
              ))}
            </View>
          </>
        )}
      </View>
      {editable && (
        <PressableScale style={[$add, $addBorder]} onPress={handleAddField}>
          <Text preset="bold" tx="password:addWebsite" style={styles.add} color={colors.primary} />
          <Icon icon="plus-circle" size={18} color={colors.primary} />
        </PressableScale>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  add: {
    marginRight: 8,
  },
  container: {
    width: "100%",
  },
})

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  width: "100%",
  backgroundColor: colors.border,
})

const $add: ViewStyle = {
  alignSelf: "flex-end",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: -12,
  paddingVertical: 12,
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  overflow: "hidden",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
})
