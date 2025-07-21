/* eslint-disable no-restricted-imports */
import { FC, useCallback, useRef, useState } from "react"
import { Button, Header, Screen, TextInput, Text } from "app/components/cores"
import Animated, { FadeInUp } from "react-native-reanimated"
import { StyleSheet, TextInput as RNInput } from "react-native"
import { AccountRecovery } from "app/static/types"
import { useToast } from "app/services/utils"
import { MethodSelection } from "./MethodSelection"
import { ForgotPasswordScreenProps } from "app/navigators"
import { idApi } from "app/services/api"

export const ForgotMethodSelectScreen: FC<ForgotPasswordScreenProps<"methodSelect">> = ({
  navigation,
}) => {
  const { notifyTx, notifyApiError } = useToast()
  // ------------------------------ PARAMS -------------------------------

  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState("")
  const [methods, setMethods] = useState<AccountRecovery[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<RNInput>(null)

  // ------------------------------ METHODS -------------------------------

  const handleRequest = async () => {
    setIsLoading(true)
    const res = await idApi.recoverAccount({ username })
    setIsLoading(false)
    if (res.kind !== "ok") {
      if (res.kind === "rejected") {
        notifyApiError(res)
        return
      }
      setIsError(true)
      notifyTx("error", "error:no_associated_account")
    } else {
      setMethods(res.data)
    }
    inputRef.current?.blur()
  }

  const onChangeText = useCallback((text: string) => {
    setIsError(false)
    setMethods([])
    setUsername(text)
  }, [])

  const navigateToOtpAuthen = useCallback((email: string, username: string) => {
    navigation.navigate("otp", { email, username })
  }, [])

  // ------------------------------ RENDER -------------------------------

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleTx={"forgot_password:title"}
        />
      }
      contentContainerStyle={styles.container}
    >
      <Text tx="forgot_password:username_or_email" style={styles.title} />
      <TextInput
        isError={isError}
        value={username}
        onChangeText={onChangeText}
        autoCapitalize="none"
        inputMode="email"
        placeholderTx="common:username"
        onSubmitEditing={handleRequest}
      />

      {methods.length === 0 && (
        <Button
          loading={isLoading}
          disabled={isLoading || !username}
          tx="forgot_password:request"
          onPress={handleRequest}
          style={styles.request}
        />
      )}
      {methods.length > 0 && (
        <Animated.View entering={FadeInUp} style={styles.request}>
          <MethodSelection
            methods={methods}
            onSelect={(email: string) => navigateToOtpAuthen(email, username)}
          />
        </Animated.View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  request: {
    marginTop: 16,
    width: "100%",
  },
  title: {
    marginBottom: 12,
  },
})
