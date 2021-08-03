import React from "react"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeNavigator } from "./home/home-navigator"
import { BrowseNavigator } from "./browse/browse-navigator"
import { ToolsNavigator } from "./tools/tools-navigator"
import { MenuNavigator } from "./menu/menu-navigator"

const Tab = createBottomTabNavigator()

export function MainTabNavigator() {
    return (
      <Tab.Navigator
        initialRouteName="homeTab"
      >
        <Tab.Screen name="homeTab" component={HomeNavigator} />
        <Tab.Screen name="browseTab" component={BrowseNavigator} />
        <Tab.Screen name="toolsTab" component={ToolsNavigator} />
        <Tab.Screen name="menuTab" component={MenuNavigator} />
      </Tab.Navigator>
    )
  }