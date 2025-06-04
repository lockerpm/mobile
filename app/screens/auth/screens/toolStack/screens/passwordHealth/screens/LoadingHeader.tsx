import { useStores } from "app/models"
import { useAppLocale, useTheme } from "app/services/context"
import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { TxKeyPath } from "app/i18n"

type Props = {
  style?: StyleProp<ViewStyle>
}

export const LoadingHeader = observer((props: Props) => {
  const { style } = props
  const { toolStore } = useStores()

  const isLoadingHealth = toolStore.isLoadingHealth
  const isDataLoading = toolStore.isDataLoading

  if (isDataLoading) return <Render title={"common.loading"} style={style} />
  if (isLoadingHealth) return <Render title={"common.calculating"} style={style} />
  return null
})

const Render = ({ title, style }: { style?: StyleProp<ViewStyle>; title: TxKeyPath }) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()

  return (
    <View
      style={[
        {
          backgroundColor: colors.background,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 4,
        },
        style,
      ]}
    >
      <Text
        size="base"
        style={{
          marginLeft: 5,
        }}
        text={translate(title) + "..."}
      />
    </View>
  )
}
