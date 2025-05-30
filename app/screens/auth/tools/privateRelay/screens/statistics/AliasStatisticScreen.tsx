import React, { FC } from "react"
import moment from "moment"
import { StyleSheet, View } from "react-native"
import { Screen, Header, Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { useAppLocale, useTheme } from "app/services/context"
import { PrivateRelayScreenProps } from "app/navigators"

export const AliasStatisticScreen: FC<PrivateRelayScreenProps<"aliasStatistic">> = observer(
  ({
    navigation,
    route: {
      params: { alias },
    },
  }) => {
    const { colors } = useTheme()
    const { translate } = useAppLocale()

    const data = [
      {
        label: translate("private_relay.title"),
        data: alias.full_address,
      },
      {
        label: translate("private_relay.manage_subdomain.block_email"),
        data: alias.num_blocked.toString(),
      },
      {
        label: translate("private_relay.manage_subdomain.forwarded_email"),
        data: alias.num_forwarded.toString(),
      },
      {
        label: translate("private_relay.manage_subdomain.create_date"),
        data: moment.unix(alias.created_time).format("DD/MM/YYYY"),
      },
    ]

    // Render
    return (
      <Screen
        padding
        header={
          <Header
            title={"Statistic"}
            leftIcon="arrow-left"
            onLeftPress={() => navigation.goBack()}
          />
        }
      >
        {data.map((item, index) => (
          <View key={index} style={[styles.item, { borderColor: colors.border }]}>
            <Text preset="label" text={item.label} />
            <Text text={item.data} style={styles.halfWidth} />
          </View>
        ))}
      </Screen>
    )
  },
)

const styles = StyleSheet.create({
  halfWidth: {
    maxWidth: "50%",
  },
  item: {
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
})
