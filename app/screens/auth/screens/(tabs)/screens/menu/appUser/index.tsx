import { View, StyleSheet, Dimensions, ViewStyle, TextStyle, Image } from "react-native"
import { Icon, PressableScale, Text } from "@/components/cores"
import { observer } from "mobx-react-lite"
import { MenuItemContainer } from "@/components/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useAppLocale } from "@/i18n"
import moment from "moment"
import { useState } from "react"
import { PlanUsage } from "./PlanUsage"
import Animated, { LinearTransition } from "react-native-reanimated"

export const AppUser = observer(() => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()
  const { user } = useStores()

  // ----------------------PARAM------------------------

  const [isShowStorage, setIsShowStorage] = useState(false)

  // ----------------------COMPUTED---------------------
  const item3 = {
    pm_lifetime_family: {
      node: <Text text="LIFETIME FAMILY" style={$planName} color={colors.primary} />,
    },
    pm_lifetime_team: {
      node: <Text text="LIFETIME TEAM" style={$planName} color={colors.primary} />,
    },

    pm_lifetime_premium: {
      node: <Text text="LIFETIME PREMIUM" style={$planName} color={colors.primary} />,
    },
    pm_free: {
      node: <Text text="FREE" style={$planName}></Text>,
    },
    pm_premium: {
      node: (
        <View style={$plan}>
          <Text text="PREMIUM" color={colors.primary} style={$planName} />
          {!user.plan?.is_family && user.plan?.next_billing_time && (
            <Text
              text={
                translate("menu:expired_time") +
                ": " +
                moment(user.plan?.next_billing_time * 1000).format("DD MMMM YYYY")
              }
              style={[$planName, $planMl]}
            />
          )}
        </View>
      ),
    },
    pm_family: {
      node: (
        <View style={$plan}>
          <Text text="FAMILY" color={colors.primary} style={$planName} />
          {user.plan?.next_billing_time && (
            <Text
              text={
                translate("menu:expired_time") +
                ": " +
                moment(user.plan?.next_billing_time * 1000).format("DD MMMM YYYY")
              }
              style={[$planName, $planMl]}
            />
          )}
        </View>
      ),
    },
  }

  return (
    <MenuItemContainer>
      <Animated.View layout={LinearTransition}>
        <PressableScale
          onPress={() => {
            setIsShowStorage(!isShowStorage)
          }}
          style={styles.itemContainer}
        >
          <Image resizeMode="contain" source={{ uri: user.avatar }} style={styles.itemImage} />
          <View style={styles.content}>
            <Text preset="bold" text={user.email} />
            {user.pwd_user_type !== "enterprise" && user.plan && item3[user.plan.alias]?.node}
            {user.pwd_user_type === "enterprise" && user.enterprise && (
              <View style={styles.fingerprintContainer}>
                <Text text={translate("common:enterprise") + ":"} style={styles.mr8} />
                <Text preset="bold" text={user.enterprise.name} color={colors.primary} />
              </View>
            )}
          </View>

          <Icon
            icon={isShowStorage ? "caret-down" : "caret-right"}
            size={20}
            color={colors.label}
          />
        </PressableScale>
        {isShowStorage && <PlanUsage />}
      </Animated.View>
    </MenuItemContainer>
  )
})
const isSmallWidth = Dimensions.get("screen").width < 390

const $plan: ViewStyle = {
  flexDirection: isSmallWidth ? "column" : "row",
}
const $planMl: ViewStyle = {
  marginLeft: isSmallWidth ? 0 : 8,
}

const $planName: TextStyle = {
  fontSize: 14,
  marginTop: 5,
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
  fingerprintContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  itemContainer: {
    alignItems: "center",
    flexDirection: "row",
    padding: 16,
  },

  itemImage: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  mr8: { marginRight: 8 },
})
