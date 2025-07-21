/* eslint-disable react-native/no-inline-styles */
import { FC, useEffect, useState } from "react"
import { Text, Screen, Button, TextProps, Header } from "app/components/cores"
import { ColorValue, ImageSourcePropType, View, Image, StyleSheet, ViewStyle } from "react-native"
import { EnterpriseInvitation } from "app/static/types"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { HomeScreenProps } from "app/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

const ASSETS = {
  user: require("assets/images/intro/user.png"),
  org: require("assets/images/intro/organization.png"),
}

export const EnterpriseInvitedScreen: FC<HomeScreenProps<"enterpriseInvited">> = observer(
  ({ navigation }) => {
    const { enterpriseStore, user } = useStores()
    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const onNext = () => {
      navigation.navigate("mainTab", {
        screen: "homeTab",
      })
    }
    // ----------------------- PARAMS ----------------------

    const [isLoading, setIsLoading] = useState(false)
    const [invitations, setInvitation] = useState<EnterpriseInvitation[]>([])

    // ----------------------- METHODS ----------------------
    const manaulInvitation = invitations.find((e) => e.domain === null)

    const invitationAction = async (status: "confirmed" | "reject") => {
      if (!manaulInvitation || !manaulInvitation.id) {
        return
      }
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

    useEffect(() => {
      if (invitations.length > 0 && manaulInvitation === undefined) {
        onNext()
      }
    }, [invitations, manaulInvitation])

    // ----------------------- RENDER ----------------------
    const footer = (
      <View style={styles.ph16}>
        <Button
          loading={isLoading}
          tx={"common:accept"}
          onPress={() => invitationAction("confirmed")}
          style={styles.accept}
        />
        <Button
          preset="secondary"
          tx={"common:decline"}
          onPress={() => invitationAction("reject")}
          textStyle={{
            color: colors.error,
          }}
          style={{
            borderColor: colors.disable,
          }}
        />
      </View>
    )

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        contentContainerStyle={styles.ph16}
        header={<Header rightIcon={"x"} onRightPress={onNext} />}
        footer={footer}
      >
        <Text preset="bold" size="xl" tx={"enterprise_invitation:invited"} style={styles.title} />

        <Item
          leftBorderColor={colors.primary}
          backgroundColor={"rgba(44,142,93,0.05)"}
          label={"enterprise_invitation:org"}
          text={manaulInvitation?.enterprise.name}
          asset={ASSETS.org}
        />

        <Item
          leftBorderColor={"blue"}
          backgroundColor={"rgba(58,75,222,0.05)"}
          label={"enterprise_invitation:invited_by"}
          text={manaulInvitation?.owner}
          asset={ASSETS.user}
        />

        <View style={themed($note)}>
          <Text tx={"enterprise_invitation:accept_note"} style={styles.accept} />
          <Text tx="enterprise_invitation:decline_note" />
        </View>
      </Screen>
    )
  }
)

interface ItemProp {
  leftBorderColor: ColorValue
  backgroundColor: ColorValue
  label: TextProps["tx"]
  text: string | undefined
  asset: ImageSourcePropType
}

const Item = (props: ItemProp) => (
  <View style={styles.itemContainer}>
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
      <Text text={props.label} style={styles.itemTitle} />
      <View style={styles.row}>
        <Image source={props.asset} style={styles.image} />
        <Text style={styles.itemText} preset="bold" text={props.text} />
      </View>
    </View>
  </View>
)

const $note: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginTop: 10,
  borderRadius: 16,
  backgroundColor: colors.block,
  padding: 20,
})
const styles = StyleSheet.create({
  accept: {
    marginBottom: 12,
  },
  image: {
    height: 40,
    marginRight: 12,
    width: 40,
  },
  itemContainer: {
    borderRadius: 8,
    flexDirection: "row",
    marginBottom: 12,
    overflow: "hidden",
  },
  itemText: {
    maxWidth: "75%",
  },
  itemTitle: {
    marginBottom: 4,
    marginLeft: 12,
  },
  ph16: {
    paddingHorizontal: 16,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  title: {
    marginBottom: 30,
    textAlign: "center",
  },
})
