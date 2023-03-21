import React from "react"
import { TouchableOpacity, ViewStyle } from "react-native"
import { useStores } from "../../../models"
import { observer } from "mobx-react-lite"

import VI from "./vietnam.svg"
import EN from "./united-states.svg"

export const LanguagePicker = observer(() => {
  const { user } = useStores()

  const CONTAINER: ViewStyle = {
    zIndex: 10,
    position: "absolute",
    left: 20,
    top: 16,
    flexDirection: "row",
    alignItems: "center",
  }

  return (
    <TouchableOpacity
      style={CONTAINER}
      onPress={() => {
        user.setLanguage(user.language === "vi" ? "en" : "vi")
        user.setMobileChangeLanguage(true)
      }}
    >
      {user.language === "vi" ? <VI height={32} width={32} /> : <EN height={32} width={32} />}
    </TouchableOpacity>
  )
})
