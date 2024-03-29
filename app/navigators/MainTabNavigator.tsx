import React, { useCallback } from "react"
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native"
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "app/services/context"
import { useStores } from "../models"
import { Icon, Text } from "app/components/cores"
import { BrowseNavigator } from "./browse/BrowseNavigator"
import { MenuNavigator } from "./menu/MenuNavigator"
import { HomeTabScreen, ToolsListScreen, AuthenticatorScreen } from "../screens"
import { SharingStatus } from "app/static/types"
import { observer } from "mobx-react-lite"
import { useHelper } from "app/services/hook"
import { TabsParamList } from "./navigators.types"

const Tab = createBottomTabNavigator<TabsParamList>()

const TabBar = observer(({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors } = useTheme()
  const { user, uiStore, cipherStore } = useStores()
  const { translate } = useHelper()
  const insets = useSafeAreaInsets()

  const mappings = {
    homeTab: {
      label: translate("common.home"),
      icon: "home",
      notiCount: 0,
    },
    browseTab: {
      label: translate("common.browse"),
      icon: "browser",
      notiCount:
        cipherStore.sharingInvitations.length +
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
      label: translate("common.tools"),
      icon: "tools",
      notiCount: 0,
    },
    menuTab: {
      label: translate("common.menu"),
      icon: "menu",
      notiCount: user.invitations.length,
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
  return uiStore.isSelecting ? null : (
    <View
      style={{ paddingBottom: insets.bottom, backgroundColor: colors.background, paddingTop: 8 }}
    >
      {/* Status bar */}
      {isStatusBarVisible && (
        <View
          style={{
            backgroundColor: colors.background,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 4,
          }}
        >
          {uiStore.isOffline ? (
            <View style={$centerStyle}>
              <Icon icon="wifi-slash" size={16} color={colors.white} />
              <Text
                size="small"
                style={{
                  marginLeft: 5,
                }}
                text={translate("navigator.is_offline")}
              />
            </View>
          ) : cipherStore.isBatchDecrypting ? (
            <Text size="small" text={translate("start.decrypting")} />
          ) : (
            <View style={$centerStyle}>
              <Icon icon="arrows-clockwise" size={18} color={colors.white} />
              <Text
                size="small"
                style={{
                  marginLeft: 5,
                }}
                text={translate("start.synching")}
              />
            </View>
          )}
        </View>
      )}
      {/* Status bar end */}

      {/* Tab items */}
      <View style={{ flexDirection: "row" }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]

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
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Icon
                icon={targetMapping.icon}
                size={20}
                color={isFocused ? colors.primary : colors.primaryText}
              />

              {notiCount > 0 && (
                <View
                  style={{
                    backgroundColor: colors.error,
                    opacity: 0.9,
                    borderRadius: 20,
                    minWidth: 17,
                    height: 17,
                    position: "absolute",
                    top: 3,
                    right: 20,
                  }}
                >
                  <Text
                    text={notiCount >= 100 ? "99+" : notiCount.toString()}
                    style={{
                      fontSize: 12,
                      textAlign: "center",
                      color: colors.white,
                      lineHeight: 17,
                    }}
                  />
                </View>
              )}

              <Text
                text={label}
                color={isFocused ? colors.primary : colors.primaryText}
                style={{
                  fontSize: 12,
                  marginTop: 3,
                }}
              />
            </TouchableOpacity>
          )
        })}
      </View>
      {/* Tab items end */}
    </View>
  )
})

export const MainTabNavigator = observer(() => {
  const renderTabbar = useCallback((props: BottomTabBarProps) => <TabBar {...props} />, [])
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="homeTab"
      tabBar={renderTabbar}
    >
      <Tab.Screen name="homeTab" component={HomeTabScreen} />
      <Tab.Screen name="browseTab" component={BrowseNavigator} />
      <Tab.Screen name="authenticatorTab" component={AuthenticatorScreen} />
      <Tab.Screen name="toolsTab" component={ToolsListScreen} />
      <Tab.Screen name="menuTab" component={MenuNavigator} />
    </Tab.Navigator>
  )
})
