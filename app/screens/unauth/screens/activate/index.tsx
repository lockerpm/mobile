import { UnAuthScreenProps } from "@/navigators"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { Button, Logo, Screen, Text } from "@/components/cores"
import { StyleSheet } from "react-native"
import { useStores } from "@/models"
import { idApi } from "@/services/api"
import { useLoggedIn } from "../hook/useLoggedIn"
import { useHelper } from "@/services/hook"
import { MotionLoading } from "@/components/utils"
import { useRoute } from "@react-navigation/native"

export const ActivateAccountScreen: FC<UnAuthScreenProps<"activateAccount">> = observer(
  ({ navigation }) => {
    const { user } = useStores()
    const { onLoggedIn } = useLoggedIn()
    const { setApiTokens } = useHelper()

    const route = useRoute()

    // @ts-ignore
    const token = route.params?.token || ""

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isValidLink, setIsValidLink] = useState<boolean>(false)
    const [buttonLoadding, setButtonLoading] = useState<boolean>(false)

    const activate = async () => {
      setIsLoading(true)
      const res = await idApi.activateEmail(token)
      if (res.kind === "ok") {
        const pmRes = await user.activate(res.data.token)
        if (pmRes.kind === "ok") {
          setIsValidLink(true)
          setApiTokens(pmRes.data.access_token)
          return
        }
      }
      setIsValidLink(false)
      setIsLoading(false)
    }

    const footerButtonActions = async () => {
      if (isLoading) return
      if (isValidLink) {
        setButtonLoading(true)
        await onLoggedIn()
        setButtonLoading(false)
      } else {
        navigation.replace("unAuthStack", {
          screen: "onBoarding",
        })
      }
    }

    // ------------------- EFFECTS -------------------
    useEffect(() => {
      if (token) {
        activate()
      }
    }, [token])

    return (
      <Screen
        disableAvoidkeyboard
        safeAreaEdges={["bottom"]}
        footer={
          <Button
            loading={buttonLoadding}
            preset="primary"
            tx={isValidLink ? "new_signup:useLocker" : "new_signup:backHome"}
            onPress={footerButtonActions}
            style={styles.mh16}
          />
        }
        contentContainerStyle={styles.container}
      >
        {!isLoading && (
          <>
            <Logo preset={"cystack-logo"} style={[styles.logo, !isValidLink && styles.invalid]} />
            <Text
              preset="bold"
              size="xl"
              tx={isValidLink ? "new_signup:activated" : "new_signup:activatedError"}
              style={styles.centerText}
            />
            <Text
              preset="label"
              size="lg"
              tx={isValidLink ? "new_signup:useLocker" : "new_signup:try_again"}
              style={styles.centerText}
            />
          </>
        )}
        {isLoading && <MotionLoading />}
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  invalid: {
    opacity: 0.5,
  },
  logo: {
    alignSelf: "center",
    height: 140,
    marginBottom: 24,
    width: 140,
  },
  mh16: {
    marginBottom: 32,
    marginHorizontal: 16,
  },
})
