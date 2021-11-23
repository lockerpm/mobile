import React from "react"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { BrowseNavigator } from "./browse/browse-navigator"
import { MenuNavigator } from "./menu/menu-navigator"
import { View } from "react-native"
import { Button, Text } from "../components"
import { color as colorLight, colorDark, fontSize } from "../theme"
import { AllItemScreen, ToolsListScreen } from "../screens"
import MaterialIconsIcon from 'react-native-vector-icons/MaterialIcons'
import { useMixins } from "../services/mixins"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useStores } from "../models"

// @ts-ignore
import HomeIcon from './icons/home.svg'
// @ts-ignore
import BrowseIcon from './icons/menu.svg'
// @ts-ignore
import ToolsIcon from './icons/settings.svg'
// @ts-ignore
import MenuIcon from './icons/menu-2.svg'
import { observer } from "mobx-react-lite"


const Tab = createBottomTabNavigator()

// @ts-ignore
const TabBar = observer(function TabBar({ state, descriptors, navigation }) {
  const { translate } = useMixins()
  const { user, uiStore } = useStores()
  const insets = useSafeAreaInsets()
  const color = uiStore.isDark ? colorDark : colorLight
  
  const mappings = {
    homeTab: {
      label: translate('common.home'),
      icon: HomeIcon,
      notiCount: 0
    },
    browseTab: {
      label: translate('common.browse'),
      icon: BrowseIcon,
      notiCount: 0
    },
    toolsTab: {
      label: translate('common.tools'),
      icon: ToolsIcon,
      notiCount: 0
    },
    menuTab: {
      label: translate('common.menu'),
      icon: MenuIcon,
      notiCount: user.invitations.length
    }
  }

  return (
    <View style={{ paddingBottom: insets.bottom, backgroundColor: color.background }}>
      {/* Offline mode */}
      {
        uiStore.isOffline && (
          <View style={{
            backgroundColor: '#161922',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 4
          }}>
            <MaterialIconsIcon
              name="wifi-off"
              size={16}
              color={color.palette.white}
            />
            <Text
              style={{
                fontSize: fontSize.small,
                color: color.palette.white,
                marginLeft: 5
              }}
              text={translate('navigator.is_offline')}
            />
          </View>
        )
      }
      {/* Offline mode end */}

      {/* Tab items */}
      <View style={{ flexDirection: 'row' }}>
        {
          state.routes.map((route, index) => {
            const { options } = descriptors[route.key];

            const targetMapping = mappings[route.name]
            const label = targetMapping ? targetMapping.label : route.name
            const Icon = targetMapping ? targetMapping.icon : () => null
            const notiCount = targetMapping ? targetMapping.notiCount : 0

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                // The `merge: true` option makes sure that the params inside the tab screen are preserved
                navigation.navigate({ name: route.name, merge: true });
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Button
                key={index}
                testID={options.tabBarTestID}
                preset="ghost"
                onPress={onPress}
                onLongPress={onLongPress}
                style={{ 
                  flex: 1, 
                  alignItems: 'center', 
                  flexDirection: 'column'
                }}
              >
                {
                  Icon && (
                    <Icon height={20} style={{
                      color: isFocused ? color.primary : color.text
                    }} />
                  )
                }
                {
                  (notiCount > 0) && (
                    <View
                      style={{
                        backgroundColor: color.palette.danger,
                        borderRadius: 20,
                        minWidth: 20,
                        height: 20,
                        position: 'absolute',
                        top: 3,
                        right: 24
                      }}
                    >
                      <Text
                        text={notiCount.toString()}
                        style={{
                          fontSize: 12,
                          textAlign: 'center',
                          color: color.palette.white,
                          lineHeight: 20
                        }}
                      />
                    </View>
                  )
                }
                <Text
                  text={label}
                  style={{
                    fontSize: 12,
                    color: isFocused ? color.primary : color.text,
                    marginTop: 3
                  }}
                />
              </Button>
            )
          })
        }
      </View>
      {/* Tab items end */}
    </View>
  );
})

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="homeTab"
      tabBar={props => <TabBar {...props} />}
    >
      <Tab.Screen name="homeTab" component={AllItemScreen} />
      <Tab.Screen name="browseTab" component={BrowseNavigator} />
      <Tab.Screen name="toolsTab" component={ToolsListScreen} />
      <Tab.Screen name="menuTab" component={MenuNavigator} />
    </Tab.Navigator>
  )
}
