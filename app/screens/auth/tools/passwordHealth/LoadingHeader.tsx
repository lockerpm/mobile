import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { Text } from "app/components/cores"
import { useHelper } from "app/services/hook"

type Props = {
  style?: StyleProp<ViewStyle>
}

export const LoadingHeader = (props: Props) => {
  const { style } = props
  const { toolStore } = useStores()
  const { colors } = useTheme()
  const { translate } = useHelper()

  const isLoadingHealth = toolStore.isLoadingHealth
  const isDataLoading = toolStore.isDataLoading

  const Render = ({ title }) => {
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
          text={title + "..."}
        />
      </View>
    )
  }

  if (isDataLoading) return <Render title={translate("common.loading") + "..."} />
  if (isLoadingHealth) return <Render title={translate("common.calculating") + "..."} />
  return null
}
