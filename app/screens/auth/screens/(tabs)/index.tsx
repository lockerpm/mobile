import { useCallback } from "react"
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { observer } from "mobx-react-lite"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon, Text } from "app/components/cores"
import { useStores } from "app/models"
import { TabsRoute } from "app/navigators"
import { SharingStatus } from "app/static/types"

import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import {
  AuthenticatorScreen,
  BrowseListScreen,
  HomeScreen,
  MenuListScreen,
  ToolsListScreen,
} from "./screens"

const Tab = createBottomTabNavigator<TabsRoute>()

const TabBar = observer(({ state, navigation }: BottomTabBarProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()
  const insets = useSafeAreaInsets()
  const { uiStore, cipherStore } = useStores()

  const mappings = {
    homeTab: {
      label: translate("common:home"),
      icon: "home",
      notiCount: 0,
    },
    browseTab: {
      label: translate("common:browse"),
      icon: "browser",
      notiCount:
        cipherStore.sharingInvitationsIgnoreAccept.length +
        cipherStore.myShares.reduce((total, s) => {
          return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
        }, 0),
    },
    authenticatorTab: {
      label: "OTP",
      icon: "authenticator",
      notiCount: 0,
    },
    toolsTab: {
      label: translate("common:tools"),
      icon: "tools",
      notiCount: 0,
    },
    menuTab: {
      label: translate("common:menu"),
      icon: "menu",
      notiCount: 0,
    },
  }

  const isStatusBarVisible =
    uiStore.isOffline ||
    cipherStore.isSynching ||
    cipherStore.isSynchingOffline ||
    cipherStore.isBatchDecrypting

  const $centerStyle: StyleProp<ViewStyle> = {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  }
  return (
    <View style={[themed($container), { paddingBottom: insets.bottom }]}>
      {/* Status bar */}
      {isStatusBarVisible && (
        <View style={themed($statusContainer)}>
          {uiStore.isOffline ? (
            <View style={$centerStyle}>
              <Icon icon="wifi-slash" size={16} />
              <Text size="xs" style={styles.ml5} tx={"navigator:is_offline"} />
            </View>
          ) : cipherStore.isBatchDecrypting ? (
            <Text size="xs" tx={"start:decrypting"} />
          ) : (
            <View style={$centerStyle}>
              <Icon icon="arrows-clockwise" size={18} />
              <Text size="xs" style={styles.ml5} tx={"start:synching"} />
            </View>
          )}
        </View>
      )}

      <View style={styles.row}>
        {state.routes.map((route, index) => {
          // @ts-ignore
          const targetMapping = mappings[route.name]
          const label = targetMapping ? targetMapping.label : route.name
          const notiCount = targetMapping ? targetMapping.notiCount : 0

          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              // @ts-ignore
              navigation.navigate({ name: route.name, merge: true })
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            })
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.item}
            >
              <Icon
                icon={targetMapping.icon}
                size={20}
                color={isFocused ? colors.primary : colors.text}
              />

              {notiCount > 0 && (
                <View style={themed($noti)}>
                  <Text
                    text={notiCount >= 100 ? "99+" : notiCount.toString()}
                    size="xxs"
                    color={colors.white}
                    style={styles.centerText}
                  />
                </View>
              )}

              <Text
                text={label}
                color={isFocused ? colors.primary : colors.text}
                size="xs"
                style={styles.title}
              />
            </TouchableOpacity>
          )
        })}
      </View>
      {/* Tab items end */}
    </View>
  )
})

export const TabNavigator = observer(() => {
  const renderTabbar = useCallback((props: BottomTabBarProps) => <TabBar {...props} />, [])
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="homeTab"
      tabBar={renderTabbar}
    >
      <Tab.Screen name="homeTab" component={HomeScreen} />
      <Tab.Screen name="browseTab" component={BrowseListScreen} />
      <Tab.Screen name="authenticatorTab" component={AuthenticatorScreen} />
      <Tab.Screen name="toolsTab" component={ToolsListScreen} />
      <Tab.Screen name="menuTab" component={MenuListScreen} />
    </Tab.Navigator>
  )
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  paddingTop: 8,
})

const $statusContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: 8,
  marginTop: -8,
})

const $noti: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
  opacity: 0.9,
  borderRadius: 20,
  minWidth: 17,
  height: 17,
  position: "absolute",
  justifyContent: "center",
  alignItems: "center",
  top: -5,
  right: 20,
})

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  item: {
    alignItems: "center",
    flex: 1,
    flexDirection: "column",
  },
  ml5: {
    marginLeft: 5,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  title: {
    marginTop: 3,
    textAlign: "center",
  },
})
