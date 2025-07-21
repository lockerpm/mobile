import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import moment from "moment"
import { Screen, Header, Text, Switch } from "app/components/cores"
import { useStores } from "app/models"
import { PrivateRelayScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"

export const ManageSubdomainScreen: FC<PrivateRelayScreenProps<"manageSubdomain">> = ({
  navigation,
  route: {
    params: { subdomain },
  },
}) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()
  const { toolStore } = useStores()

  const [useSubdomain, setUseSubdomain] = useState(false)

  const data = useMemo(
    () => [
      {
        label: translate("private_relay:manage_subdomain.your_subdomain"),
        data: subdomain.subdomain,
      },
      {
        label: translate("private_relay:manage_subdomain.num_alias"),
        data: subdomain.num_alias,
      },
      {
        label: translate("private_relay:manage_subdomain.block_email"),
        data: subdomain?.num_spam || 0,
      },
      {
        label: translate("private_relay:manage_subdomain.forwarded_email"),
        data: subdomain?.num_forwarded || 0,
      },
      {
        label: translate("private_relay:manage_subdomain.create_date"),
        data: moment.unix(subdomain.created_time).format("DD/MM/YYYY"),
      },
    ],
    [
      subdomain.created_time,
      subdomain.num_alias,
      subdomain?.num_forwarded,
      subdomain?.num_spam,
      subdomain.subdomain,
      translate,
    ]
  )

  const useSubdomainForGenerate = async () => {
    setUseSubdomain(!useSubdomain)
    const res = await toolStore.useSubdomain(!useSubdomain)
    if (res.kind !== "ok") {
      notifyApiError(res)
    }
  }

  const fetchUseSubdomain = useCallback(async () => {
    const res = await toolStore.fetchUseSubdomain()
    if (res.kind === "ok") {
      setUseSubdomain(res.data)
    }
  }, [toolStore])

  useEffect(() => {
    fetchUseSubdomain()
  }, [fetchUseSubdomain])

  // ---------------------RENDER------------------------
  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      contentContainerStyle={styles.ph16}
      header={
        <Header
          titleTx={"private_relay:manage_subdomain.title"}
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
      <TouchableOpacity onPress={useSubdomainForGenerate}>
        <View style={styles.useContainer}>
          <Text tx={"private_relay:manage_subdomain.use_subdomain"} style={styles.useText} />
          <Switch value={useSubdomain} onPress={useSubdomainForGenerate} />
        </View>
      </TouchableOpacity>
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
  ph16: {
    paddingHorizontal: 16,
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
