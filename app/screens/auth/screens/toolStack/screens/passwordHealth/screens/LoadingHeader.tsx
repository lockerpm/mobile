/* eslint-disable react-native/no-inline-styles */
import { useStores } from "app/models"
import { StyleProp, View, ViewStyle } from "react-native"
import { Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { TxKeyPath, useAppLocale } from "app/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  style?: StyleProp<ViewStyle>
}

export const LoadingHeader = observer((props: Props) => {
  const { style } = props
  const { toolStore } = useStores()

  const isLoadingHealth = toolStore.isLoadingHealth
  const isDataLoading = toolStore.isDataLoading

  if (isDataLoading) return <Render title={"common:loading"} style={style} />
  if (isLoadingHealth) return <Render title={"common:calculating"} style={style} />
  return null
})

const Render = ({ title, style }: { style?: StyleProp<ViewStyle>; title: TxKeyPath }) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  return (
    <View
      style={[
        {
          backgroundColor: colors.disable,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 4,
        },
        style,
      ]}
    >
      <Text
        size="sm"
        style={{
          marginLeft: 5,
        }}
        text={translate(title) + "..."}
      />
    </View>
  )
}
