import React, { FC } from "react"
import { StyleSheet, View } from "react-native"
import { PrivateRelayScreenProps } from "../../route"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { Button, Text } from "app/components/cores"
import { debounce } from "app/utils/utils"
import { BlurView } from "@react-native-community/blur"

export const RelayInfoScreen: FC<PrivateRelayScreenProps<"relayInfo">> = ({
  navigation,
  route: {
    params: { freeAccount, data },
  },
}) => {
  const { colors } = useTheme()
  const { translate } = useHelper()

  const rootEmailDesc = freeAccount
    ? [
        translate("private_relay.desc.one"),
        translate("private_relay.desc.two"),
        translate("private_relay.desc.three"),
      ]
    : [
        translate("private_relay.desc_premium.one"),
        translate("private_relay.desc_premium.two"),
        translate("private_relay.desc_premium.three"),
        translate("private_relay.desc_premium.note"),
      ]

  const subDomainDesc = [
    translate("private_relay.manage_subdomain.desc.one"),
    translate("private_relay.manage_subdomain.desc.two"),
  ]

  const descriptions = data.kind === "email" ? rootEmailDesc : subDomainDesc
  const title =
    data.kind === "email" ? data.email : data.subdomain ? `${data.subdomain}.maily.org` : ""

  return (
    <View style={styles.flex}>
      <BlurView
        blurType={"dark"}
        blurAmount={0}
        // @ts-ignore
        blurRadius={10}
        overlayColor="rgba(0,0,0,0.1)"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.transparent }]}
      />
      <View style={styles.container}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {!!title && <Text preset="bold" text={title} style={styles.title} />}
          <View style={[styles.info, { borderColor: colors.border }]}>
            {descriptions.map((desc, index) => (
              <View
                key={index}
                style={{
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <Text text={index.toString() + "."} preset="bold" />
                  <Text
                    text={desc}
                    style={{
                      marginLeft: 8,
                      flexGrow: 1,
                      flexShrink: 1,
                    }}
                  />
                </View>
                <View
                  style={{
                    marginLeft: 16,
                    width: "100%",
                    height: 1,
                    backgroundColor: colors.border,
                    marginTop: 8,
                  }}
                />
              </View>
            ))}
          </View>
        </View>
        <Button text={translate("common.ok")} onPress={debounce(navigation.goBack, 500)} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
    padding: 16,
  },
  content: {
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flex: {
    flex: 1,
  },
  info: {
    borderTopWidth: 1,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
})
