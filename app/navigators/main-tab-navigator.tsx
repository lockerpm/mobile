import React, { useEffect, useState } from "react"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { BrowseNavigator } from "./browse/browse-navigator"
import { MenuNavigator } from "./menu/menu-navigator"
import { View } from "react-native"
import Icon from 'react-native-vector-icons/Ionicons'
import { Button, Text } from "../components"
import { color } from "../theme"
import { AllItemScreen, ToolsListScreen } from "../screens"
import MaterialIconsIcon from 'react-native-vector-icons/MaterialIcons'
import NetInfo from "@react-native-community/netinfo"

const Tab = createBottomTabNavigator()

const mappings = {
  homeTab: {
    label: 'Home',
    icon: 'home'
  },
  browseTab: {
    label: 'Browse',
    icon: 'apps'
  },
  toolsTab: {
    label: 'Tools',
    icon: 'build'
  },
  menuTab: {
    label: 'Menu',
    icon: 'menu'
  }
}

const TabBar = ({ state, descriptors, navigation, isOffline }) => {
  return (
    <View>
      {/* Offline mode */}
      {
        isOffline && (
          <View style={{ 
            backgroundColor: '#161922', 
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 2
          }}>
            <MaterialIconsIcon
              name="wifi-off"
              size={16}
              color={color.palette.white}
            />
            <Text
              style={{
                fontSize: 10,
                color: color.palette.white,
                marginLeft: 5
              }}
              text="Locker is currently in offline mode."
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
            const icon = targetMapping ? targetMapping.icon : 'alert'

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
                isNativeBase
                variant="ghost"
                onPress={onPress}
                onLongPress={onLongPress}
                style={{ flex: 1, alignItems: 'center' }}
              >
                <Icon 
                  name={icon}
                  size={20}
                  color={isFocused ? color.palette.green : color.text}
                  style={{
                    textAlign: 'center'
                  }}
                />
                <Text
                  text={label}
                  style={{
                    fontSize: 12,
                    color: isFocused ? color.palette.green : color.text
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
}

export function MainTabNavigator() {
  const [isOffline, setIsOffline] = useState(false)
  useEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable)
      setIsOffline(offline)
    })

    return () => {
      removeNetInfoSubscription()
    };
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="homeTab"
      tabBar={props => <TabBar {...props} isOffline={isOffline} />}
    >
      <Tab.Screen name="homeTab" component={AllItemScreen} />
      <Tab.Screen name="browseTab" component={BrowseNavigator} />
      <Tab.Screen name="toolsTab" component={ToolsListScreen} />
      <Tab.Screen name="menuTab" component={MenuNavigator} />
    </Tab.Navigator>
  )
}
