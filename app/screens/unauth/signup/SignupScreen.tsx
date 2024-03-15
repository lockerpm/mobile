import React, { useState, useCallback, FC } from "react"
import { Linking, TouchableOpacity, View } from "react-native"
import { RootStackScreenProps } from "app/navigators/navigators.types"
import { useAuthentication, useCipherHelper, useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { Checkbox } from "react-native-ui-lib"
import { Screen, Text, Button, TextInput, Logo, Header } from "app/components/cores"
import { PRIVACY_POLICY_URL, TERMS_URL } from "app/config/constants"
import { Logger } from "app/utils/utils"
import { observer } from "mobx-react-lite"
import Animated, { FadeInUp } from "react-native-reanimated"
import { ConfirmCreateMPModal, PasswordStrength } from "app/components/utils"

export const SignupScreen: FC<RootStackScreenProps<"signup">> = observer((props) => {
  const navigation = props.navigation
  const { colors } = useTheme()
  const { translate, validateMasterPassword } = useHelper()

  const { getPasswordStrength } = useCipherHelper()
  const { registerLocker } = useAuthentication()

  // ---------------- PARAMS ---------------------

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [masterPassword, setMasterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [hint, setHint] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(-1)

  const [showConfirmCreateModal, setShowConfirmCreateModal] = useState<boolean>(false)

  const [fullname, setFullname] = useState("")
  const [agreed, setAgreed] = useState(false)

  // ---------------- COMPUTED ---------------------

  const isError = !!masterPassword && !!confirmPassword && masterPassword !== confirmPassword
  const masterPasswordError = validateMasterPassword(masterPassword).error
  const isReady = !masterPasswordError && !isError && masterPassword && confirmPassword && agreed

  // ---------------- METHODS ---------------------

  // Confirm master pass
  const handleCreate = async () => {
    setIsLoading(true)
    setShowConfirmCreateModal(false)

    const res = await registerLocker(email, fullname, masterPassword, hint, passwordStrength)
    if (res.kind === "ok") {
      navigation.navigate("login")
    }
    setIsLoading(false)
  }

  const goBack = () => {
    props.navigation.goBack()
  }

  const navigateLogin = () => {
    props.navigation.replace("login")
  }

  // ---------------- EFFECT --------------------

  // ---------------- RENDER ---------------------

  const Footer = useCallback(
    () => (
      <View
        style={{
          margin: 12,
          marginBottom: 30,
        }}
      >
        <Text
          preset="label"
          style={{
            textAlign: "center",
            marginVertical: 12,
          }}
        >
          {translate("signup.has_account") + " "}
          <Text
            onPress={navigateLogin}
            style={{ color: colors.primary }}
            text={translate("common.login")}
          />
        </Text>
      </View>
    ),
    []
  )
  return (
    <Screen preset="auto" contentContainerStyle={{ paddingBottom: 20 }}>
      <Header leftIcon="arrow-left" onLeftPress={goBack} />

      <View style={{ paddingHorizontal: 20 }}>
        <Logo
          preset={"default"}
          style={{ height: 80, width: 70, marginBottom: 10, alignSelf: "center" }}
        />
        <Text
          preset="bold"
          size="xl"
          text={translate("signup.title")}
          style={{ textAlign: "center" }}
        />

        <TextInput
          isRequired
          animated
          label={translate("common.email")}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          animated
          isRequired
          isPassword
          isError={isError || !!masterPasswordError}
          helper={masterPasswordError || translate("common.password_not_match")}
          label={translate("common.password")}
          onChangeText={(text) => {
            setMasterPassword(text)
            const strength = getPasswordStrength(text)
            setPasswordStrength(strength ? strength.score : -1)
          }}
          value={masterPassword}
        />

        {!!masterPassword && (
          <Animated.View entering={FadeInUp} style={{ width: "100%" }}>
            <PasswordStrength value={passwordStrength} style={{ marginTop: 15 }} />
          </Animated.View>
        )}

        <TextInput
          animated
          isRequired
          isPassword
          isError={isError}
          helper={translate("common.password_not_match")}
          label={translate("signup.confirm_password")}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />

        <TextInput
          animated
          label={translate("common.fullname")}
          value={fullname}
          onChangeText={setFullname}
        />

        <TextInput
          animated
          label={translate("create_master_pass.hint")}
          onChangeText={setHint}
          value={hint}
        />

        <TermAndConditions agreed={agreed} setAgreed={setAgreed} />

        <Button
          loading={isLoading}
          disabled={isLoading || !isReady}
          text={translate("common.sign_up")}
          onPress={() => setShowConfirmCreateModal(true)}
          style={{
            width: "100%",
            marginTop: 30,
            marginBottom: 20,
          }}
        />

        <ConfirmCreateMPModal
          isCreating={isLoading}
          isOpen={showConfirmCreateModal}
          onClose={() => setShowConfirmCreateModal(false)}
          onNext={handleCreate}
        />

        <Footer />
      </View>
    </Screen>
  )
})

const TermAndConditions = ({
  agreed,
  setAgreed,
}: {
  agreed: boolean
  setAgreed: (val: boolean) => void
}) => {
  const { translate } = useHelper()
  const { colors } = useTheme()
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 10,
      }}
    >
      <Checkbox
        value={agreed}
        color={colors.primary}
        onValueChange={setAgreed}
        style={{
          marginVertical: 7,
          marginRight: 12,
        }}
        labelStyle={{
          color: colors.primaryText,
          fontSize: 16,
        }}
      />
      <TouchableOpacity onPress={() => setAgreed(!agreed)}>
        <Text>
          {translate("signup.agree_with") + " "}
          <Text
            color={colors.primary}
            text={translate("signup.terms")}
            onPress={() => {
              Linking.canOpenURL(TERMS_URL)
                .then((val) => {
                  if (val) Linking.openURL(TERMS_URL)
                })
                .catch((e) => Logger.error(e))
            }}
          />
          <Text text={" " + translate("common.and") + " "} />
          <Text
            text={translate("signup.conditions")}
            color={colors.primary}
            onPress={() => {
              Linking.canOpenURL(PRIVACY_POLICY_URL)
                .then((val) => {
                  if (val) Linking.openURL(PRIVACY_POLICY_URL)
                })
                .catch((e) => Logger.error(e))
            }}
          />
        </Text>
      </TouchableOpacity>
    </View>
  )
}
