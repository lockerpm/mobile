import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { Text } from "app/components/cores"
import { translate } from "app/i18n"

type Props = {
  style?: StyleProp<ViewStyle>
}

export const LoadingHeader = (props: Props) => {
  const { style } = props
  const { toolStore } = useStores()
  const { colors } = useTheme()

  const isLoadingHealth = toolStore.isLoadingHealth
  const isDataLoading = toolStore.isDataLoading

  const Render = ({ title }) => {
    return (
      <View
        style={[
          {
            backgroundColor: colors.title,
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
          color={colors.white}
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
