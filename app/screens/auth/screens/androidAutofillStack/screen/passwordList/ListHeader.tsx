import { View, StyleSheet } from "react-native"

import { PressableIcon, Text } from "app/components/cores"
import { TxKeyPath } from "app/i18n"

interface Props {
  headerTx: TxKeyPath
  goBack: () => void
  openAdd: () => void
  openPasswordGenerator: () => void
}

export const ListHeader = ({ headerTx, goBack, openAdd, openPasswordGenerator }: Props) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.container}>
        <View style={styles.title}>
          <PressableIcon icon={"arrow-left"} onPress={goBack} style={styles.mr8} />
          <Text
            preset="bold"
            size="xl"
            weight="semiBold"
            numberOfLines={2}
            ellipsizeMode="tail"
            tx={headerTx}
          />
        </View>
        <View style={styles.rowContainer}>
          <PressableIcon
            icon="password-fill"
            onPress={openPasswordGenerator}
            containerStyle={styles.iconContainer}
          />
          <PressableIcon icon="plus" onPress={openAdd} containerStyle={styles.iconContainer} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerContainer: {
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 16,
  },
  iconContainer: {
    padding: 8,
  },
  mr8: {
    marginRight: 8,
  },
  rowContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  title: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 32,
  },
})
