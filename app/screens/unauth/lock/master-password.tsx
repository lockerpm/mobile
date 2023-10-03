import React, { useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, BackHandler, View } from "react-native"
import { AutoImage as Image, Button, Layout, Text, FloatingInput } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { commonStyles, fontSize } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { APP_ICON } from "../../../common/mappings"
import MaterialCommunityIconsIcon from "react-native-vector-icons/MaterialCommunityIcons"
import { useCipherAuthenticationMixins } from "../../../services/mixins/cipher/authentication"
import { CipherView, LoginUriView, LoginView } from "../../../../core/models/view"
import { useCipherHelpersMixins } from "../../../services/mixins/cipher/helpers"
import { CipherType } from "../../../../core/enums"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { EnterpriseInvitation } from "../../../services/api"
import { EnterpriseInvitationModal } from "./enterprise-invitation-modal"
import { LanguagePicker } from "../../../components/utils"
import { useCoreService } from "../../../services/core-service"

interface Props {
  biometryType: "faceid" | "touchid" | "biometric" | null
  handleLogout: () => void
}

export const LockByMasterPassword = observer(
  ({ biometryType, handleLogout }: Props) => {
    const navigation = useNavigation()
    const { user, uiStore, enterpriseStore } = useStores()
    const { notify, translate, notifyApiError, color } = useMixins()
    const { logout, sessionLogin, biometricLogin } = useCipherAuthenticationMixins()
    const { createCipher } = useCipherDataMixins()
    const { getPasswordStrength, newCipher } = useCipherHelpersMixins()
    const { cryptoService } = useCoreService()

    // ---------------------- PARAMS -------------------------
    const [isValidForBiometric, setIsValidForBiometric] = useState(false)
    const [masterPassword, setMasterPassword] = useState("")
    const [isUnlocking, setIsUnlocking] = useState(false)
    const [isBioUnlocking, setIsBioUnlocking] = useState(false)
    const [isSendingHint, setIsSendingHint] = useState(false)
    const [isError, setIsError] = useState(false)

    // enterprise invitaion param
    const [isShowedInvitationPopup, setIsShowedInvitaionPopup] = useState(false)
    const [isShowInvitation, setIsShowInvitation] = useState(false)

    const [enterpeiseInvitations, setEnterpriseInvitations] = useState<EnterpriseInvitation[]>([])

    // ---------------------- METHODS -------------------------

    const isAutofillAnroid =
      uiStore.isFromAutoFill || uiStore.isOnSaveLogin || uiStore.isFromAutoFillItem

    const showInvitation = (() => {
      if (enterpeiseInvitations.length === 0) return false
      return enterpeiseInvitations.some((e) => e.domain !== null)
    })()

    // ---------------------- METHODS -------------------------
      // first check is crypto keyu exist 
  const checkKey = async () => {
    // Online login
    const key = await cryptoService.getKey()
    if (!key) {
      setIsValidForBiometric(false)
      return false
    } else {
      setIsValidForBiometric(true)
      return true
    }
  }

    // Prepare to save password
    const createMasterPasswordItem = async () => {
      const payload: CipherView = newCipher(CipherType.MasterPassword)

      const data = new LoginView()
      data.username = "locker.io"
      data.password = masterPassword

      const uriView = new LoginUriView()
      uriView.uri = "https://locker.io"
      data.uris = [uriView]

      payload.name = "Locker Master Password"
      payload.login = data
      const pwStrength = getPasswordStrength(masterPassword)
      const res = await createCipher(payload, pwStrength.score, [], true)
      if (res.kind !== "ok") {
        notify("error", translate("error.master_password"))
      }
    }

    const handleUnlock = async () => {
      if (showInvitation) {
        setIsShowInvitation(true)
        return
      }
      if (masterPassword) {
        setIsError(false)
        setIsUnlocking(true)
        const res = await sessionLogin(masterPassword, createMasterPasswordItem)
        setIsUnlocking(false)
        if (res.kind === "ok") {
          setMasterPassword("")
          navigation.navigate("mainStack", { screen: "start" })
        } else if (res.kind === "unauthorized") {
          navigation.navigate("login", { type: "individual" })
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
        } else {
          setIsError(true)
        }
      } else {
        setIsError(true)
      }
    }

    const handleUnlockBiometric = async () => {
      const hadKey = await checkKey()
      if (!hadKey) return

      if (showInvitation) {
        setIsShowInvitation(true)
        return
      }
      setIsBioUnlocking(true)
      const res = await biometricLogin()
      setIsBioUnlocking(false)
      if (res.kind === "ok") {
        setMasterPassword("")
        navigation.navigate("mainStack", { screen: "start" })
      }
    }

    const handleGetHint = async () => {
      setIsSendingHint(true)
      const res = await user.sendPasswordHint(user.email)
      setIsSendingHint(false)
      if (res.kind === "ok") {
        notify("success", translate("lock.hint_sent"), 5000)
      } else {
        notifyApiError(res)
      }
    }

    const fetchEnterpriseInvitation = async () => {
      const res = await enterpriseStore.invitations()
      setEnterpriseInvitations(res)
    }
    // ---------------------- COMPONENTS -------------------------

    const footer = (
      <Button
        isLoading={isSendingHint}
        isDisabled={isSendingHint}
        preset="link"
        text={translate("lock.get_hint")}
        onPress={handleGetHint}
        style={{
          width: "100%",
        }}
      />
    )

    // -------------- EFFECT ------------------
    // enterprise invitations
    useEffect(() => {
      if (isShowedInvitationPopup) {
        fetchEnterpriseInvitation()
        setIsShowedInvitaionPopup(false)
      }
    }, [isShowedInvitationPopup])

    useEffect(() => {
      checkKey()
      fetchEnterpriseInvitation()
    }, [])

    useEffect(() => {
        navigation.addListener("focus", () => {
          if (user.isBiometricUnlock) {
            handleUnlockBiometric()
          }
        })
    }, [])

    // ---------------------- RENDER -------------------------

    return (
      <Layout footer={footer}>
        <EnterpriseInvitationModal
          isOpen={isShowInvitation}
          enterpeiseInvitations={enterpeiseInvitations}
          onClose={() => {
            setIsShowedInvitaionPopup(true)
            setIsShowInvitation(false)
          }}
        />
        <LanguagePicker />
        <View style={{ alignItems: "flex-end", marginTop: 8 }}>
          {isAutofillAnroid ? (
            <Button
              text={translate("common.cancel").toUpperCase()}
              textStyle={{ fontSize: fontSize.p }}
              preset="link"
              onPress={() => BackHandler.exitApp()}
            />
          ) : (
            <Button
              text={translate("common.logout").toUpperCase()}
              textStyle={{ fontSize: fontSize.p }}
              preset="link"
              onPress={handleLogout}
            />
          )}
        </View>
        <View style={{ alignItems: "center", paddingTop: "10%" }}>
          <Image source={APP_ICON.icon} style={{ height: 63, width: 63 }} />

          <Text preset="header" style={{ marginBottom: 10, marginTop: 25 }} tx={"lock.title"} />

          <Text style={{ textAlign: "center" }} tx={"lock.desc"} />

          {/* Current user */}
          <View
            style={{
              marginTop: 16,
              marginBottom: 16,
              borderRadius: 20,
              backgroundColor: color.block,
              flexDirection: "row",
              alignItems: "center",
              padding: 4,
            }}
          >
            {!!user.avatar && (
              <View style={{ borderRadius: 14, overflow: "hidden" }}>
                <Image
                  source={{ uri: user.avatar }}
                  style={{
                    height: 28,
                    width: 28,
                    backgroundColor: color.white,
                  }}
                />
              </View>
            )}

            <Text
              style={{
                fontSize: fontSize.small,
                color: color.title,
                marginHorizontal: 10,
              }}
            >
              {user.email}
            </Text>
          </View>
          {/* Current user end */}

          {/* Master pass input */}
          <FloatingInput
            isPassword
            isInvalid={isError}
            label={translate("common.master_pass")}
            onChangeText={setMasterPassword}
            value={masterPassword}
            style={{ width: "100%" }}
            onSubmitEditing={handleUnlock}
          />
          {/* Master pass input end */}

          <Button
            isLoading={isUnlocking}
            isDisabled={isUnlocking || !masterPassword}
            text={translate("common.unlock")}
            onPress={handleUnlock}
            style={{
              width: "100%",
              marginTop: 20,
            }}
          />

          <Button
            // isLoading={isBioUnlocking}
            isDisabled={isBioUnlocking}
            preset="ghost"
            onPress={() => {
              if (!user.isBiometricUnlock) {
                notify("error", translate("error.biometric_not_enable"))
                return
              }
              if (!isValidForBiometric) {
                notify("info", translate("error.not_valid_for_biometric"))
                return
              }
              handleUnlockBiometric()
            }}
            style={{
              width: "100%",
              marginVertical: 10,
            }}
          >
            <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { marginHorizontal: 5 }]}>
              <MaterialCommunityIconsIcon
                name={biometryType === "faceid" ? "face-recognition" : "fingerprint"}
                size={20}
                color={color.textBlack}
              />
              <Text
                preset="black"
                text={translate(`common.${biometryType}_unlocking`)}
                style={{ marginLeft: 7 }}
              />
            </View>
          </Button>
        </View>
      </Layout>
    )
  },
)