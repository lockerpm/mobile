import React from "react"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeNavigator } from "./home/home-navigator"
import { BrowseNavigator } from "./browse/browse-navigator"
import { ToolsNavigator } from "./tools/tools-navigator"
import { MenuNavigator } from "./menu/menu-navigator"
import { View } from "react-native"
import Icon from 'react-native-vector-icons/Ionicons'
import { Button, Text } from "../components"
import { color } from "../theme"

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

const TabBar = ({ state, descriptors, navigation }) => {
  return (
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
  ); 
}

export function MainTabNavigator() {
    return (
      <Tab.Navigator
        initialRouteName="homeTab"
        tabBar={props => <TabBar {...props} />}
      >
        <Tab.Screen name="homeTab" component={HomeNavigator} />
        <Tab.Screen name="browseTab" component={BrowseNavigator} />
        <Tab.Screen name="toolsTab" component={ToolsNavigator} />
        <Tab.Screen name="menuTab" component={MenuNavigator} />
      </Tab.Navigator>
    )
  }