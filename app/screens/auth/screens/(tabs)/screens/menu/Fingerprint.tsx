import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { observer } from "mobx-react-lite"
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated"

import { Icon, PressableScale, Text } from "app/components/cores"
import { MenuItemContainer } from "app/components/utils"
import { useStores } from "app/models"

import { useAppTheme } from "@/utils/useAppTheme"

export const Fingerprint = observer(() => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { user } = useStores()

  const [showFingerprint, setShowFingerprint] = useState(false)

  return (
    <MenuItemContainer>
      <Animated.View layout={LinearTransition}>
        <PressableScale
          onPress={() => {
            setShowFingerprint(!showFingerprint)
          }}
          style={styles.itemContainer}
        >
          <Icon icon={"fingerprint"} />
          <View style={styles.content}>
            <Text tx={"menu:fingerprint"} />
          </View>

          <Icon icon={showFingerprint ? "eye-slash" : "eye"} size={20} color={colors.label} />
        </PressableScale>
        {showFingerprint && (
          <Animated.View
            entering={FadeInUp}
            layout={LinearTransition}
            style={styles.fingerprintContainer}
          >
            {user.fingerprint.split("-").map((e, index) => (
              <Text key={index} style={styles.centerText}>
                <Text color={colors.error} text={index !== 0 ? "-" + e : e} />
              </Text>
            ))}
          </Animated.View>
        )}
      </Animated.View>
    </MenuItemContainer>
  )
})

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
  fingerprintContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 16,
    paddingTop: 0,
  },
  flex: {
    flex: 1,
  },
  itemContainer: {
    alignItems: "center",
    flexDirection: "row",
    padding: 16,
  },
})
