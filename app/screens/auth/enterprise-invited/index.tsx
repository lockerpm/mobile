import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { AutoImage as Image, Text, Layout, Button, Icon } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { ColorValue, ImageSourcePropType, TouchableOpacity, View } from "react-native"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { EnterpriseInvitation } from "app/static/types"


const ASSETS = {
  user: require('./user.png'),
  org: require("./organization.png")
}

export const EnterpriseInvitedScreen = observer(function EnterpriseInvitedScreen() {
  const navigation = useNavigation()
  const { enterpriseStore, user } = useStores()

  const { translate, color } = useMixins()

  const onNext = () => {
    navigation.navigate("mainTab", { screen: user.defaultTab })
  }
  // ----------------------- PARAMS ----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [invitations, setInvitation] = useState<EnterpriseInvitation[]>([])

  // ----------------------- METHODS ----------------------
  const manaulInvitation = invitations.find(e => e.domain === null)
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
        isLoading={isLoading}
        text={translate('common.accept')}
        onPress={() =>
          invitationAction("confirmed")
        }
        style={{
          width: '100%',
          marginBottom: 12,
        }}
      />
      <Button
        preset="outlinePlain"
        text={translate('common.decline')}
        onPress={() => invitationAction("reject")}
        textStyle={{
          color: color.error
        }}
        style={{
          width: '100%',
          borderColor: color.disabled
        }}
      />
    </View>

  )

  return (
    <Layout
      footer={footer}
    >
      <View style={{ alignItems: "flex-end" }}>
        <TouchableOpacity
          onPress={onNext}
          style={{
            paddingBottom: 10,
            paddingLeft: 10
          }}>
          <Icon icon={"cross"} size={24} color={color.textBlack} />
        </TouchableOpacity>
      </View>

      <Text
        preset="largeHeader"
        text={translate('enterprise_invitation.invited')}
        style={{
          textAlign: "center",
          marginBottom: 30
        }}
      />

      <Item
        leftBorderColor={color.primary}
        backgroundColor={"rgba(44,142,93,0.05)"}
        label={translate('enterprise_invitation.org')}
        text={manaulInvitation?.enterprise.name}
        asset={ASSETS.org}
      />

      <Item
        leftBorderColor={"blue"}
        backgroundColor={"rgba(58,75,222,0.05)"}
        label={translate('enterprise_invitation.invited_by')}
        text={manaulInvitation?.owner}
        asset={ASSETS.user}
      />

      <View style={{
        marginTop: 10,
        borderRadius: 16,
        backgroundColor: color.block,
        padding: 20
      }}>
        <Text
          preset="black"
          text={translate('enterprise_invitation.accept_note')}
          style={{ marginBottom: 12 }}
        />
        <Text
          preset="black"
          text={translate('enterprise_invitation.decline_note')}
        />
      </View>
    </Layout>
  )
})

interface ItemProp {
  leftBorderColor: ColorValue,
  backgroundColor: ColorValue,
  label: string,
  text: string,
  asset: ImageSourcePropType
}

const Item = (props: ItemProp) => <View style={{
  borderRadius: 8,
  overflow: "hidden",
  flexDirection: "row",
  marginBottom: 12
}}>
  <View style={{
    width: 8,
    backgroundColor: props.leftBorderColor
  }} />

  <View style={{
    backgroundColor: props.backgroundColor,
    paddingLeft: 20,
    paddingVertical: 8,
    width: "100%"
  }}>
    <Text
      text={props.label}
      style={{
        marginLeft: 12,
        marginBottom: 4
      }}
    />
    <View style={{
      flexDirection: "row",
      alignItems: "center"
    }}>
      <Image source={props.asset} style={{
        width: 40,
        height: 40,
        marginRight: 12
      }} />
      <Text style={{ maxWidth: "75%" }} preset="header" text={props.text} />
    </View>
  </View>
</View>