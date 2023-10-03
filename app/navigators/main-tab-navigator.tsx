import React, { useEffect } from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { BrowseNavigator } from "./browse/browse-navigator"
import { MenuNavigator } from "./menu/menu-navigator"
import { View } from "react-native"
import { Button, Text } from "../components"
import { fontSize } from "../theme"
import { AllItemScreen, ToolsListScreen, AuthenticatorScreen } from "../screens"
import MaterialIconsIcon from "react-native-vector-icons/MaterialIcons"
import { useMixins } from "../services/mixins"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useStores } from "../models"
import { observer } from "mobx-react-lite"
import { SharingStatus } from "../config/types"

import HomeIcon from "./icons/home.svg"
import BrowseIcon from "./icons/menu.svg"
import ToolsIcon from "./icons/settings.svg"
import MenuIcon from "./icons/menu-2.svg"
import AuthenticatorIcon from "./icons/authenticator.svg"
import Intercom from "@intercom/intercom-react-native"
import { Logger } from "../utils/logger"

const Tab = createBottomTabNavigator()

// @ts-ignore
const TabBar = observer(({ state, descriptors, navigation }) => {
  const { translate, color } = useMixins()
  const { user, uiStore, cipherStore } = useStores()

  const insets = useSafeAreaInsets()

  const mappings = {
    homeTab: {
      label: translate("common.home"),
      icon: HomeIcon,
      notiCount: 0,
    },
    browseTab: {
      label: translate("common.browse"),
      icon: BrowseIcon,
      notiCount:
        cipherStore.sharingInvitations.length +
        cipherStore.myShares.reduce((total, s) => {
          return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
        }, 0),
    },
    authenticatorTab: {
      label: "OTP",
      icon: AuthenticatorIcon,
      notiCount: 0,
    },
    toolsTab: {
      label: translate("common.tools"),
      icon: ToolsIcon,
      notiCount: 0,
    },
    menuTab: {
      label: translate("common.menu"),
      icon: MenuIcon,
      notiCount: user.invitations.length,
    },
  }

  const isStatusBarVisible =
    uiStore.isOffline ||
    cipherStore.isSynching ||
    cipherStore.isSynchingOffline ||
    cipherStore.isBatchDecrypting

  return uiStore.isSelecting ? null : (
    <View style={{ paddingBottom: insets.bottom, backgroundColor: color.background }}>
      {/* Status bar */}
      {isStatusBarVisible && (
        <View
          style={{
            backgroundColor: "#161922",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 4,
          }}
        >
          {uiStore.isOffline ? (
            <>
              <MaterialIconsIcon name="wifi-off" size={16} color={color.white} />
              <Text
                style={{
                  fontSize: fontSize.small,
                  color: color.white,
                  marginLeft: 5,
                }}
                text={translate("navigator.is_offline")}
              />
            </>
          ) : cipherStore.isBatchDecrypting ? (
            <>
              <MaterialIconsIcon name="vpn-key" size={18} color={color.white} />
              <Text
                style={{
                  fontSize: fontSize.small,
                  color: color.white,
                  marginLeft: 5,
                }}
                text={translate("start.decrypting")}
              />
            </>
          ) : (
            <>
              {/* <Animated.View style={spin}> */}
              <MaterialIconsIcon name="sync" size={18} color={color.white} />
              {/* </Animated.View> */}
              <Text
                style={{
                  fontSize: fontSize.small,
                  color: color.white,
                  marginLeft: 5,
                }}
                text={translate("start.synching")}
              />
            </>
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
          const Icon = targetMapping ? targetMapping.icon : () => null
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
            <Button
              key={index}
              testID={options.tabBarTestID}
              preset="ghost"
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              {Icon && (
                <Icon
                  height={20}
                  style={{
                    color: isFocused ? color.primary : color.text,
                  }}
                />
              )}
              {notiCount > 0 && (
                <View
                  style={{
                    backgroundColor: color.error,
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
                      color: color.white,
                      lineHeight: 17,
                    }}
                  />
                </View>
              )}

              <Text
                text={label}
                style={{
                  fontSize: 12,
                  color: isFocused ? color.primary : color.text,
                  marginTop: 3,
                }}
              />
            </Button>
          )
        })}
      </View>
      {/* Tab items end */}
    </View>
  )
})

export function MainTabNavigator() {
 
  return (
    <Tab.Navigator initialRouteName="homeTab" tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="homeTab" component={AllItemScreen} />
      <Tab.Screen name="browseTab" component={BrowseNavigator} />
      <Tab.Screen name="authenticatorTab" component={AuthenticatorScreen} />
      <Tab.Screen name="toolsTab" component={ToolsListScreen} />
      <Tab.Screen name="menuTab" component={MenuNavigator} />
    </Tab.Navigator>
  )
}