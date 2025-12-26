import { FC } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button, Text } from "app/components/cores"
import { TxKeyPath } from "app/i18n"
import { PrivateRelayScreenProps } from "app/navigators"
import { debounce } from "app/utils/utils"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

export const RelayInfoScreen: FC<PrivateRelayScreenProps<"relayInfo">> = ({
  navigation,
  route: {
    params: { freeAccount, data },
  },
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const insets = useSafeAreaInsets()

  const rootEmailDesc: TxKeyPath[] = freeAccount
    ? ["private_relay:desc.one", "private_relay:desc.two", "private_relay:desc.three"]
    : [
        "private_relay:desc_premium.one",
        "private_relay:desc_premium.two",
        "private_relay:desc_premium.three",
        "private_relay:desc_premium.note",
      ]

  const subDomainDesc: TxKeyPath[] = [
    "private_relay:manage_subdomain.desc.one",
    "private_relay:manage_subdomain.desc.two",
  ]

  const descriptions = data.kind === "email" ? rootEmailDesc : subDomainDesc
  const title =
    data.kind === "email" ? data.email : data.subdomain ? `${data.subdomain}.maily.org` : ""

  return (
    <View style={styles.flex}>
      <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {!!title && <Text preset="bold" text={title} style={styles.title} />}
          <View style={[styles.info, { borderColor: colors.border }]}>
            {descriptions.map((desc, index) => (
              <View key={index} style={styles.mt8}>
                <View style={styles.row}>
                  <Text text={index.toString() + "."} preset="bold" />
                  <Text tx={desc} style={styles.desc} />
                </View>
                <View style={themed($border)} />
              </View>
            ))}
          </View>
        </View>
        <Button tx={"common:ok"} onPress={debounce(navigation.goBack, 500)} />
      </View>
    </View>
  )
}

const $border: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginLeft: 16,
  width: "100%",
  height: 1,
  backgroundColor: colors.border,
  marginTop: 8,
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  content: {
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  desc: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 8,
  },
  flex: {
    flex: 1,
  },
  info: {
    borderTopWidth: 1,
  },
  mt8: {
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
})
