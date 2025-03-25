import * as React from "react"
import { View, Image, StyleSheet } from "react-native"
import { Button, Text } from "app/components/cores"
import { useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"

export interface EmptyCipherListProps {
  onAdd: () => void
  onImport: () => void
}

const HOME_EMPTY_CIPHER = require("assets/images/emptyCipherList/home-empty-cipher.png")

export const EmptyCipherList = observer((props: EmptyCipherListProps) => {
  const { onAdd, onImport } = props
  const { translate } = useHelper()

  return (
    <View style={{ alignItems: "center", marginTop: "10%" }}>
      <Image source={HOME_EMPTY_CIPHER} resizeMode="contain" style={{ height: 55, width: 120 }} />

      <Text
        preset="bold"
        size="large"
        style={{ marginBottom: 8, marginTop: 10, textAlign: "center" }}
        text={translate("all_items.empty.title")}
      />

      <Text
        preset="label"
        text={translate("all_items.empty.desc")}
        size="base"
        style={{ textAlign: "center", lineHeight: 21 }}
      />

      <View style={styles.buttonContainer}>
        <Button
          text={translate("all_items.empty.btn")}
          onPress={onAdd}
          style={styles.buttonMargin}
        />
        <Button
          preset="secondary"
          text={translate("settings.import")}
          onPress={onImport}
          style={styles.buttonMargin}
        />
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 26,
  },
  buttonMargin: {
    marginHorizontal: 8,
  },
})
