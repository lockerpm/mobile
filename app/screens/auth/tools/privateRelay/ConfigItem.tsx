import React, { useState } from "react"
import { LayoutAnimation, TouchableOpacity, View } from "react-native"
import { useTheme } from "app/services/context"
import { SubdomainData } from "app/static/types"
import { Text, Button, ImageIcon, Icon } from "app/components/cores"
import Animated, { FadeInUp } from "react-native-reanimated"
import { useHelper } from "app/services/hook"

interface ItemProps {
  isFreeAccount: boolean
  isRootEmail: boolean
  email?: string
  subdomain?: SubdomainData
  manageSubdomain?: () => void
  createSubdomain?: () => void
}

export const ConfigItem = ({
  isFreeAccount,
  isRootEmail,
  email,
  subdomain,
  manageSubdomain,
  createSubdomain,
}: ItemProps) => {
  const { colors } = useTheme()
  const [showDesc, setShowDesc] = useState(false)

  const { translate } = useHelper()

  const rootEmailDesc = isFreeAccount
    ? [
        translate("private_relay.desc.one"),
        translate("private_relay.desc.two"),
        translate("private_relay.desc.three"),
      ]
    : [
        translate("private_relay.desc_premium.one"),
        translate("private_relay.desc_premium.two"),
        translate("private_relay.desc_premium.three"),
      ]

  const subDomainDesc = [
    translate("private_relay.manage_subdomain.desc.one"),
    translate("private_relay.manage_subdomain.desc.two"),
  ]
  const descriptions = isRootEmail ? rootEmailDesc : subDomainDesc
  const title = isRootEmail ? email : subdomain ? `${subdomain.subdomain}.maily.org` : ""
  return (
    <TouchableOpacity
      onPress={() => {
        LayoutAnimation.configureNext({
          duration: 250,
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
          },
        })
        setShowDesc(!showDesc)
      }}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginHorizontal: 20,
          marginVertical: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", maxWidth: "80%" }}>
            <ImageIcon icon={"root-email"} size={36} />
            <View style={{ marginLeft: 8 }}>
              <Text
                text={
                  isRootEmail
                    ? translate("private_relay.root_email")
                    : subdomain
                    ? translate("private_relay.manage_subdomain.your_subdomain")
                    : translate("private_relay.no_subdomain")
                }
              />
              {!!title && <Text preset="bold" text={title} />}
            </View>
          </View>
          <Icon icon={showDesc ? "caret-up" : "caret-down"} size={20} />
        </View>

        {showDesc && (
          <Animated.View style={{ marginTop: 8 }} entering={FadeInUp}>
            {descriptions.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  marginRight: 16,
                  marginVertical: 2,
                  alignItems: "center",
                }}
              >
                <Icon icon="dot" size={24} />
                <Text text={item} />
              </View>
            ))}

            {!!subdomain && (
              <Button
                text={translate("private_relay.manage_subdomain.manage")}
                style={{ marginTop: 24 }}
                onPress={manageSubdomain}
              />
            )}
            {!subdomain && !isRootEmail && (
              <Button
                text={translate("common.create")}
                style={{ marginTop: 24 }}
                onPress={createSubdomain}
              />
            )}
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  )
}
