import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Alert,
  BackHandler,
  View,
  Image,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TouchableOpacity,
} from "react-native"
import { useAuthentication, useCipherData, useCipherHelper } from "app/services/hook"
import { useStores } from "app/models"
import { BiometricsType, EnterpriseInvitation } from "app/static/types"
import { useNavigation } from "@react-navigation/native"
import {
  Logo,
  Button,
  Screen,
  Text,
  TextInput,
  Header,
  PressableText,
  Icon,
} from "app/components/cores"
import { EnterpriseInvitationModal } from "./EnterpriseInvitationModal"
import { AppScreenProps } from "app/navigators/navigators.types"
import { useToast } from "app/services/utils"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { isAndroidAutofillService } from "@/utils/autofillHelper"
import { useCoreService } from "@/services/coreService"
import Config from "@/config"

interface Props {
  handleLogout: () => void
  handleUnlock: () => Promise<void>
  isUnlocking: boolean
  setIsUnlocking: (val: boolean) => void
  biometryType: BiometricsType
}

const SCREEN_HEIGHT = Dimensions.get("window").height
const hideLogo = SCREEN_HEIGHT < 700
export const LockByMasterPassword = ({
  isUnlocking,
  biometryType,
  setIsUnlocking,
  handleLogout,
  handleUnlock,
}: Props) => {
  const navigation = useNavigation<AppScreenProps<"lock">["navigation"]>()
  const { user, enterpriseStore } = useStores()
  const { cryptoService } = useCoreService()
  const { notifyTx, notifyApiError } = useToast()
  const { translate } = useAppLocale()
  const { sessionLogin, biometricLogin } = useAuthentication()
  const { createMasterPasswordItem } = useCipherData()
  const { getPasswordStrength } = useCipherHelper()

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  // ---------------------- PARAMS -------------------------

  const [masterPassword, setMasterPassword] = useState("")
  const [isSendingHint, setIsSendingHint] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isError, setIsError] = useState(false)

  // enterprise invitaion param
  const [isShowInvitation, setIsShowInvitation] = useState(false)
  const [enterpeiseInvitations, setEnterpriseInvitations] = useState<EnterpriseInvitation[]>([])

  // ---------------------- METHODS -------------------------

  const showInvitation = enterpeiseInvitations.length > 0

  // ---------------------- METHODS -------------------------

  const unlock = async () => {
    setIsUnlocking(true)
    const res = await sessionLogin(masterPassword, async () => {
      await createMasterPasswordItem(masterPassword, getPasswordStrength(masterPassword).score)
    })
    if (res.kind === "ok") {
      await handleUnlock()
    } else if (res.kind === "unauthorized") {
      navigation.navigate("unAuthStack", {
        screen: "loginStack",
        params: {
          screen: "login",
        },
      })
    } else if (res.kind === "enterprise-lock") {
      Alert.alert("", translate("alert:enterprise_lock"), [
        {
          text: translate("common:ok"),
          style: "cancel",
          onPress: () => null,
        },
      ])
    } else if (res.kind === "enterprise-system-lock") {
      Alert.alert("", translate("alert:enterprise_system_lock"), [
        {
          text: translate("common:ok"),
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
    if (user.email) {
      setIsSendingHint(true)
      const res = await user.sendPasswordHint(user.email)
      setIsSendingHint(false)
      if (res.kind === "ok") {
        notifyTx("success", "lock:hint_sent")
      } else {
        notifyApiError(res)
      }
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

  const handleUnlockBiometric = async () => {
    if (!user.isBiometricUnlock) {
      notifyTx("error", "error:biometric_not_enable")
      return
    }
    const key = await cryptoService.getKey()
    if (!key) {
      notifyTx("info", "error:not_valid_for_biometric")
      return
    }

    if (showInvitation) {
      setIsShowInvitation(true)
      return
    }
    setIsUnlocking(true)

    const res = await biometricLogin()
    if (res.kind === "ok") {
      await handleUnlock()
    }
    setIsUnlocking(false)
  }

  // -------------- EFFECT ------------------
  useEffect(() => {
    if (!isAndroidAutofillService) {
      fetchEnterpriseInvitation()
    }
  }, [])

  // ---------------------- RENDER -------------------------
  const header = useMemo(
    () => (
      <Header
        RightActionComponent={
          isAndroidAutofillService ? (
            <PressableText
              weight="bold"
              color={colors.primary}
              text={translate("common:cancel").toUpperCase()}
              onPress={() => BackHandler.exitApp()}
            />
          ) : (
            <PressableText
              text={translate("common:signout").toUpperCase()}
              weight="bold"
              color={colors.primary}
              onPress={handleLogout}
            />
          )
        }
      />
    ),
    [colors.primary, handleLogout, isAndroidAutofillService, translate]
  )
  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={header}
      footer={
        <Button
          preset="teriatary"
          disabled={isSendingHint}
          tx={"lock:get_hint"}
          onPress={handleGetHint}
        />
      }
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
      <Text preset="bold" size="xl" style={styles.title} tx={"lock:title"} />
      {!Config.IS_PROD && (
        <Text preset="bold" size="xl" style={styles.title} text={"------ Staging ------"} />
      )}
      <Text style={styles.textCenter} tx={"lock:desc"} />
      <View style={styles.center}>
        <View style={themed($email)}>
          {!!user.avatar && (
            <Image resizeMode="contain" source={{ uri: user.avatar }} style={styles.avatar} />
          )}

          <Text size="sm" text={user.email || ""} style={styles.email} />
        </View>
      </View>

      <TextInput
        isPassword
        animated
        isError={isError}
        labelTx={"common:master_pass"}
        onChangeText={(val) => {
          setMasterPassword(val)
          if (isError) {
            setIsError(false)
          }
        }}
        onFocus={forcus}
        onBlur={blur}
        value={masterPassword}
        onSubmitEditing={unlock}
      />

      <Button
        loading={isUnlocking}
        disabled={isUnlocking || !masterPassword}
        tx={"common:unlock"}
        onPress={unlock}
        style={styles.mgTop20}
        preset="primary"
      />
      {biometryType !== BiometricsType.None && (
        <TouchableOpacity
          disabled={isUnlocking}
          onPress={handleUnlockBiometric}
          style={styles.faceIdContainer}
        >
          <View style={styles.faceId}>
            <Icon icon={biometryType === BiometricsType.FaceID ? "face-id" : "fingerprint"} />

            <Text
              // @ts-ignore
              text={"  " + translate(`common:${biometryType}_unlocking`)}
            />
          </View>
        </TouchableOpacity>
      )}
    </Screen>
  )
}

const $email: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginVertical: 16,
  borderRadius: 20,
  backgroundColor: colors.block,
  flexDirection: "row",
  alignItems: "center",
  padding: 4,
})

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
    paddingHorizontal: 16,
  },

  email: {
    marginHorizontal: 10,
  },
  faceId: {
    alignItems: "center",
    flexDirection: "row",
  },
  faceIdContainer: {
    alignItems: "center",
    marginVertical: 25,
    width: "100%",
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
