import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import moment from "moment"
import { Screen, Header, Text, Toggle } from "app/components/cores"
import { useHelper } from "app/services/hook"
import { useAppLocale, useTheme } from "app/services/context"
import { useStores } from "app/models"
import { PrivateRelayScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"

export const ManageSubdomainScreen: FC<PrivateRelayScreenProps<"manageSubdomain">> = ({
  navigation,
  route: {
    params: { subdomain },
  },
}) => {
  const { colors } = useTheme()
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()
  const { toolStore } = useStores()

  const [useSubdomain, setUseSubdomain] = useState(false)

  const data = useMemo(
    () => [
      {
        label: translate("private_relay.manage_subdomain.your_subdomain"),
        data: subdomain.subdomain,
      },
      {
        label: translate("private_relay.manage_subdomain.num_alias"),
        data: subdomain.num_alias,
      },
      {
        label: translate("private_relay.manage_subdomain.block_email"),
        data: subdomain?.num_spam || 0,
      },
      {
        label: translate("private_relay.manage_subdomain.forwarded_email"),
        data: subdomain?.num_forwarded || 0,
      },
      {
        label: translate("private_relay.manage_subdomain.create_date"),
        data: moment.unix(subdomain.created_time).format("DD/MM/YYYY"),
      },
    ],
    [subdomain],
  )

  const useSubdomainForGenerate = useCallback(async (useDomain: boolean) => {
    const res = await toolStore.useSubdomain(useDomain)
    if (res.kind !== "ok") {
      notifyApiError(res)
    }
  }, [])

  const fetchUseSubdomain = useCallback(async () => {
    const res = await toolStore.fetchUseSubdomain()
    if (res.kind === "ok") {
      setUseSubdomain(res.data)
    }
  }, [])

  useEffect(() => {
    fetchUseSubdomain()
  }, [])

  // ---------------------RENDER------------------------
  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      padding
      header={
        <Header
          title={translate("private_relay.manage_subdomain.title")}
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
        />
      }
    >
      {data.map((item, index) => (
        <View key={index} style={[styles.item, { borderColor: colors.border }]}>
          <Text preset="label" text={item.label} />
          <Text>{item.data}</Text>
        </View>
      ))}

      {/** Enable use subdomain to generte future aliases */}
      <View style={styles.useContainer}>
        <Text
          text={translate("private_relay.manage_subdomain.use_subdomain")}
          style={styles.useText}
        />
        <Toggle variant="switch" value={useSubdomain} onValueChange={useSubdomainForGenerate} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  useContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  useText: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
})
