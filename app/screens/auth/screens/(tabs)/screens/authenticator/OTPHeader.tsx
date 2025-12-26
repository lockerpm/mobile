import { StyleSheet, View } from "react-native"

import { Text, PressableIcon } from "app/components/cores"

interface Props {
  openAdd: () => void
}

export const AuthenticatorHeader = ({ openAdd }: Props) => {
  // ----------------------- RENDER ------------------------

  return (
    <View style={styles.container}>
      <Text preset="heading" tx={"authenticator:title"} />

      <PressableIcon icon="plus" size={24} onPress={openAdd} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    height: 56,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
})
