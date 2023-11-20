import React, { FC } from "react"
import { View, Share, TouchableOpacity, Image, SafeAreaView, Platform } from "react-native"
import { Button, Icon, Text } from "app/components/cores"
import LinearGradient from "react-native-linear-gradient"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { observer } from "mobx-react-lite"
import { AppStackScreenProps } from "app/navigators/navigators.types"

const IS_IOS = Platform.OS === "ios"

export const ReferFriendScreen: FC<AppStackScreenProps<"refer_friend">> = observer((props) => {
  const navigation = props.navigation
  const route = props.route
  const { colors } = useTheme()
  const { copyToClipboard, translate } = useHelper()

  const gradientColor = IS_IOS
    ? ["#F1F2F3", "#D5EBD920", "#26833460"]
    : ["#FFFFFF", "#D5EBD920", "#26833460"]

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: translate("refer_friend.refer_header") + route.params.referLink,
      })
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message)
    }
  }

  // ----------------------- RENDER -----------------------
  return (
    <SafeAreaView
      style={{
        backgroundColor: colors.block,
        paddingHorizontal: 0,
        flex: 1,
      }}
    >
      <LinearGradient
        colors={gradientColor}
        style={{
          height: "40%",
          borderBottomRightRadius: 60,
          borderBottomLeftRadius: 60,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon
          icon={"x"}
          size={24}
          containerStyle={{
            alignSelf: "flex-end",
            position: "absolute",
            top: 0,
            zIndex: 2,
            left: 20,
          }}
          onPress={() => navigation.goBack()}
        />
        <Image
          resizeMode="contain"
          source={require("assets/images/intro/refer.png")}
          style={{
            marginTop: 20,
            width: 200,
            height: 200,
          }}
        />
      </LinearGradient>
      <View
        style={{
          marginHorizontal: 20,
        }}
      >
        <Text
          preset="bold"
          size="xl"
          style={{ marginTop: 32 }}
          text={translate("refer_friend.title")}
        />

        <Text style={{ marginVertical: 16 }} text={translate("refer_friend.desc")} />

        <TouchableOpacity
          onPress={() =>
            copyToClipboard(translate("refer_friend.refer_header") + route.params.referLink)
          }
          style={{
            borderColor: colors.title,
            borderRadius: 4,
            borderWidth: 0.2,
            padding: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Icon icon="link" size={18} />
          <Text
            text={route.params.referLink ? route.params.referLink : "Placeholder.."}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      <Button
        style={{
          marginHorizontal: 20,
          marginTop: 16,
        }}
        text={translate("refer_friend.btn")}
        onPress={() => onShare()}
      />
    </SafeAreaView>
  )
})
