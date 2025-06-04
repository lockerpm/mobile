import React, { FC } from "react"
import moment from "moment"
import { StyleSheet, View } from "react-native"
import { Screen, Header, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { PrivateRelayScreenProps } from "app/navigators"
import { TxKeyPath } from "app/i18n"

export const AliasStatisticScreen: FC<PrivateRelayScreenProps<"aliasStatistic">> = ({
  navigation,
  route: {
    params: { alias },
  },
}) => {
  const { colors } = useTheme()

  const data: { data: string; label: TxKeyPath }[] = [
    {
      label: "private_relay.title",
      data: alias.full_address,
    },
    {
      label: "private_relay.manage_subdomain.block_email",
      data: alias.num_blocked.toString(),
    },
    {
      label: "private_relay.manage_subdomain.forwarded_email",
      data: alias.num_forwarded.toString(),
    },
    {
      label: "private_relay.manage_subdomain.create_date",
      data: moment.unix(alias.created_time).format("DD/MM/YYYY"),
    },
  ]

  // Render
  return (
    <Screen
      padding
      header={
        <Header
          titleTx={"private_relay.statistic"}
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
        />
      }
    >
      {data.map((item, index) => (
        <View key={index} style={[styles.item, { borderColor: colors.border }]}>
          <Text preset="label" tx={item.label} />
          <Text text={item.data} style={styles.halfWidth} />
        </View>
      ))}
    </Screen>
  )
}

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
