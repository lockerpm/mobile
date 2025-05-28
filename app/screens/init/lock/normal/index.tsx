import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, BackHandler, View, Image, StyleSheet, Dimensions } from "react-native"
import { useAuthentication, useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { EnterpriseInvitation } from "app/static/types"
import { useNavigation } from "@react-navigation/native"
import { useAppLocale, useTheme } from "app/services/context"
import { Logo, Button, Screen, Text, TextInput, Header } from "app/components/cores"
import { EnterpriseInvitationModal } from "./EnterpriseInvitationModal"
import { RootStackScreenProps } from "app/navigators/navigators.types"

interface Props {
  handleLogout: () => void
  handleUnlock: () => Promise<void>
}

const SCREEN_HEIGHT = Dimensions.get("window").height
const hideLogo = SCREEN_HEIGHT < 700
export const LockByMasterPassword = ({ handleLogout, handleUnlock }: Props) => {
  const { colors } = useTheme()
  const navigation = useNavigation<RootStackScreenProps<"lock">["navigation"]>()
  const { user, uiStore, enterpriseStore } = useStores()
  const { notify, notifyApiError } = useHelper()
  const { translate } = useAppLocale()
  const { sessionLogin } = useAuthentication()
  const { createMasterPasswordItem } = useCipherData()
  const { getPasswordStrength } = useCipherHelper()

  // ---------------------- PARAMS -------------------------

  const [masterPassword, setMasterPassword] = useState("demo@1234")
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isSendingHint, setIsSendingHint] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isError, setIsError] = useState(false)

  // enterprise invitaion param
  const [isShowInvitation, setIsShowInvitation] = useState(false)
  const [enterpeiseInvitations, setEnterpriseInvitations] = useState<EnterpriseInvitation[]>([])

  // ---------------------- METHODS -------------------------

  const isAutofillAnroid = uiStore.isAndroidAutofillService

  // ---------------------- METHODS -------------------------

  const unlock = async () => {
    setIsUnlocking(true)
    const res = await sessionLogin(masterPassword, async () => {
      await createMasterPasswordItem(masterPassword, getPasswordStrength(masterPassword))
    })
    if (res.kind === "ok") {
      await handleUnlock()
    } else if (res.kind === "unauthorized") {
      navigation.navigate("unAuthStack", {
        screen: "loginStack",
      })
    } else if (res.kind === "enterprise-lock") {
      Alert.alert("", translate("alert.enterprise_lock"), [
        {
          text: translate("common.ok"),
          style: "cancel",
          onPress: () => null,
        },
      ])
    } else if (res.kind === "enterprise-system-lock") {
      Alert.alert("", translate("alert.enterprise_system_lock"), [
        {
          text: translate("common.ok"),
          style: "cancel",
          onPress: () => null,
        },
      ])
    } else if (res.kind === "enterprise-belongs") {
      await fetchEnterpriseInvitation()
    } else {
      setIsError(true)
    }
    setIsUnlocking(false)
  }

  const forcus = useCallback(() => setIsFocused(true), [])
  const blur = useCallback(() => setIsFocused(false), [])
  const handleGetHint = useCallback(async () => {
    setIsSendingHint(true)
    const res = await user.sendPasswordHint(user.email)
    setIsSendingHint(false)
    if (res.kind === "ok") {
      notify("success", translate("lock.hint_sent"), 5000)
    } else {
      notifyApiError(res)
    }
  }, [user.email])

  const fetchEnterpriseInvitation = useCallback(async () => {
    const res = await enterpriseStore.invitations()
    if (res.length > 0) {
      const filterEnterpeiseInvitations = enterpeiseInvitations.filter((e) => e.domain !== null)
      if (filterEnterpeiseInvitations.length > 0) {
        setEnterpriseInvitations(filterEnterpeiseInvitations)
        setIsShowInvitation(true)
      }
    }
  }, [])

  // -------------- EFFECT ------------------
  useEffect(() => {
    fetchEnterpriseInvitation()
  }, [])

  // ---------------------- RENDER -------------------------
  const header = useMemo(
    () => (
      <Header
        RightActionComponent={
          isAutofillAnroid ? (
            <Text
              preset="bold"
              color={colors.primary}
              text={translate("common.cancel").toUpperCase()}
              onPress={() => BackHandler.exitApp()}
            />
          ) : (
            <Text
              text={translate("common.signout").toUpperCase()}
              preset="bold"
              color={colors.primary}
              onPress={handleLogout}
            />
          )
        }
      />
    ),
    [isAutofillAnroid],
  )
  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={["bottom"]}
      header={header}
      contentContainerStyle={styles.container}
    >
      <EnterpriseInvitationModal
        isOpen={isShowInvitation}
        enterpeiseInvitations={enterpeiseInvitations}
        onClose={() => {
          setIsShowInvitation(false)
        }}
      />

      {!(isFocused && hideLogo) && <Logo preset={"cystack-logo"} style={styles.logo} />}
      <Text preset="bold" size="xl" style={styles.title} tx={"lock.title"} />
      <Text style={styles.textCenter} tx={"lock.desc"} />
      <View style={styles.center}>
        <View
          style={{
            marginVertical: 16,
            borderRadius: 20,
            backgroundColor: colors.block,
            flexDirection: "row",
            alignItems: "center",
            padding: 4,
          }}
        >
          {!!user.avatar && (
            <Image resizeMode="contain" source={{ uri: user.avatar }} style={styles.avatar} />
          )}

          <Text
            size="base"
            text={user.email}
            style={{
              marginHorizontal: 10,
            }}
          />
        </View>
      </View>

      <TextInput
        isPassword
        animated
        isError={isError}
        label={translate("common.master_pass")}
        onChangeText={(val) => {
          setMasterPassword(val)
          isError && setIsError(false)
        }}
        onFocus={forcus}
        onBlur={blur}
        value={masterPassword}
        onSubmitEditing={unlock}
      />

      <Button
        loading={isUnlocking}
        disabled={isUnlocking || !masterPassword}
        text={translate("common.unlock")}
        onPress={unlock}
        style={styles.mgTop20}
        preset="primary"
      />

      <Button
        preset="teriatary"
        disabled={isSendingHint}
        text={translate("lock.get_hint")}
        onPress={handleGetHint}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  center: {
    alignItems: "center",
  },
  container: {
    justifyContent: "space-between",
  },
  logo: { alignSelf: "center", height: 70, marginBottom: 10, width: 70 },
  mgTop20: {
    marginTop: 20,
  },
  textCenter: {
    textAlign: "center",
  },
  title: { marginBottom: 10, textAlign: "center" },
})
