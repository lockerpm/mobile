import React, {  useEffect, useState } from "react"
import { Text, Screen, Button, Icon } from "app/components/cores"
import { ColorValue, ImageSourcePropType, TouchableOpacity, View, Image } from "react-native"
import { EnterpriseInvitation } from "app/static/types"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import { observer } from "mobx-react-lite"
import { useHelper } from "app/services/hook"
import { useNavigation } from "@react-navigation/native"

const ASSETS = {
  user: require("assets/images/intro/user.png"),
  org: require("assets/images/intro/organization.png"),
}

export const EnterpriseInvitedScreen = observer(
  () => {
    const navigation = useNavigation() as any
    const { enterpriseStore, user } = useStores()
    const { translate } = useHelper()
    const { colors } = useTheme()

    const onNext = () => {
      navigation.navigate("mainTab", { screen: user.defaultTab })
    }
    // ----------------------- PARAMS ----------------------

    const [isLoading, setIsLoading] = useState(false)
    const [invitations, setInvitation] = useState<EnterpriseInvitation[]>([])

    // ----------------------- METHODS ----------------------
    const manaulInvitation = invitations.find((e) => e.domain === null)
    if (invitations.length > 0 && manaulInvitation === undefined) {
      onNext()
    }

    const invitationAction = async (status: "confirmed" | "reject") => {
      setIsLoading(true)
      const res = await enterpriseStore.invitationsActions(manaulInvitation?.id, status)
      if (res.kind === "ok" && status === "confirmed") {
        user.getUserPw()
      }
      setIsLoading(false)
      onNext()
    }

    const fetchInvitations = async () => {
      const res = await enterpriseStore.invitations()
      setInvitation(res)
    }

    // ----------------------- EFFECT ----------------------
    useEffect(() => {
      enterpriseStore.setEnterpriseInvited(false)
      fetchInvitations()
    }, [])

    // ----------------------- RENDER ----------------------
    const footer = (
      <View>
        <Button
          loading={isLoading}
          text={translate("common.accept")}
          onPress={() => invitationAction("confirmed")}
          style={{
            marginBottom: 12,
          }}
        />
        <Button
          preset="secondary"
          text={translate("common.decline")}
          onPress={() => invitationAction("reject")}
          textStyle={{
            color: colors.error,
          }}
          style={{
            width: "100%",
            borderColor: colors.disable,
          }}
        />
      </View>
    )

    return (
      <Screen safeAreaEdges={["top", "bottom"]} padding footerPadding footer={footer}>
        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={onNext}
            style={{
              paddingBottom: 10,
              paddingLeft: 10,
            }}
          >
            <Icon icon={"x"} size={24} />
          </TouchableOpacity>
        </View>

        <Text
          preset="bold"
          size="xl"
          text={translate("enterprise_invitation.invited")}
          style={{
            textAlign: "center",
            marginBottom: 30,
          }}
        />

        <Item
          leftBorderColor={colors.primary}
          backgroundColor={"rgba(44,142,93,0.05)"}
          label={translate("enterprise_invitation.org")}
          text={manaulInvitation?.enterprise.name}
          asset={ASSETS.org}
        />

        <Item
          leftBorderColor={"blue"}
          backgroundColor={"rgba(58,75,222,0.05)"}
          label={translate("enterprise_invitation.invited_by")}
          text={manaulInvitation?.owner}
          asset={ASSETS.user}
        />

        <View
          style={{
            marginTop: 10,
            borderRadius: 16,
            backgroundColor: colors.block,
            padding: 20,
          }}
        >
          <Text
            text={translate("enterprise_invitation.accept_note")}
            style={{ marginBottom: 12 }}
          />
          <Text text={translate("enterprise_invitation.decline_note")} />
        </View>
      </Screen>
    )
  },
)

interface ItemProp {
  leftBorderColor: ColorValue
  backgroundColor: ColorValue
  label: string
  text: string
  asset: ImageSourcePropType
}

const Item = (props: ItemProp) => (
  <View
    style={{
      borderRadius: 8,
      overflow: "hidden",
      flexDirection: "row",
      marginBottom: 12,
    }}
  >
    <View
      style={{
        width: 8,
        backgroundColor: props.leftBorderColor,
      }}
    />

    <View
      style={{
        backgroundColor: props.backgroundColor,
        paddingLeft: 20,
        paddingVertical: 8,
        width: "100%",
      }}
    >
      <Text
        text={props.label}
        style={{
          marginLeft: 12,
          marginBottom: 4,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Image
          source={props.asset}
          style={{
            width: 40,
            height: 40,
            marginRight: 12,
          }}
        />
        <Text style={{ maxWidth: "75%" }} preset="bold" size="large" text={props.text} />
      </View>
    </View>
  </View>
)
