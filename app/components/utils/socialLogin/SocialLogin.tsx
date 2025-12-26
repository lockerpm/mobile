import { ImageStyle, Platform, StyleProp, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { UnAuthScreenProps } from "app/navigators"
import { useSocialLogin } from "app/services/hook"

import { GithubLogin } from "./GithubLogin"
import { MicrosoftLogin } from "./MicrosoftLogin"
import { ImageIcon } from "../../cores"

const IS_IOS = Platform.OS === "ios"

interface Props {
  isSingIn: boolean
  setIsLoading: (val: boolean) => void
  onLoggedIn: (newUser: boolean, token: string) => Promise<void>
  style?: StyleProp<ViewStyle>
}

export const SocialLogin = ({ style, isSingIn, ...callbackProps }: Props) => {
  const navigation = useNavigation<UnAuthScreenProps<"loginStack">["navigation"]>()
  const { googleLogin, facebookLogin, appleLogin } = useSocialLogin(callbackProps)

  return (
    <View style={[style, $centerRowSpaceBtw]}>
      <ImageIcon style={$mh16} icon={"google"} size={32} onPress={googleLogin} />
      {IS_IOS && <ImageIcon style={$mh16} icon={"apple"} size={32} onPress={appleLogin} />}
      <ImageIcon style={$mh16} icon={"facebook"} size={32} onPress={facebookLogin} />

      <GithubLogin {...callbackProps} />
      <MicrosoftLogin {...callbackProps} />
      {isSingIn && (
        <ImageIcon
          style={$mh16}
          icon={"sso"}
          size={32}
          onPress={() => {
            navigation.navigate("unAuthStack", {
              screen: "ssoStack",
              params: {
                screen: "ssoIdentifier",
              },
            })
          }}
        />
      )}
    </View>
  )
}

const $centerRowSpaceBtw: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
}

const $mh16: ImageStyle = {
  marginHorizontal: 12,
}
