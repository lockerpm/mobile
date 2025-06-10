import { BrowseStackScreenProps } from "app/navigators"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { Screen, Text } from "app/components/cores"
import { View } from "react-native"

export const CipherEditScreen: FC<BrowseStackScreenProps<"cipherEdit">> = observer(() => {
  return (
    <Screen preset="auto" padding safeAreaEdges={["bottom"]}>
      <View>
        <Text>Cipher Edit Screen</Text>
      </View>
    </Screen>
  )
})
