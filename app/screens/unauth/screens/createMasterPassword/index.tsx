import { FC, useCallback, useEffect, useState } from "react"
import { Alert, View, Image, StyleSheet, ViewStyle } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import { CommonActions } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import Animated, { FadeInUp } from "react-native-reanimated"

import { Button, Logo, PressableText, Screen, Text, TextInput } from "app/components/cores"
import { PasswordPolicyViolationsModal, PasswordStrength } from "app/components/utils"
import { useStores } from "app/models"
import { UnAuthScreenProps } from "app/navigators"
import { useAuthentication, useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useBiometricType } from "app/services/utils"
import { LockType, MPEncodeConfig, PolicyType } from "app/static/types"
import { logCreateMasterPwEvent } from "app/utils/analytics"
import { KdfType } from "core/enums/kdfType"

import { SetupEncryptionKeyOptions } from "@/components/utils/mpEncodeConfig/SetupEncryptionKeyOptions"
import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

import { ConfirmCreateMPModal } from "./ConfirmCreateMpModal"

export const CreateMasterPasswordScreen: FC<UnAuthScreenProps<"createMasterPassword">> = observer(
  ({ navigation }) => {
    const { user, uiStore } = useStores()
    const { getPasswordStrength, checkPasswordPolicy } = useCipherHelper()
    const { logout, registerLocker, sessionLogin } = useAuthentication()
    const { validateMasterPassword } = useHelper()
    const { isBiometricAvailable } = useBiometricType()
    const { loadFolders, loadCollections, loadOrganizations, createMasterPasswordItem } =
      useCipherData()
    const { translate } = useAppLocale()
    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    // -------------- PARAMS ------------------

    const [masterPassword, setMasterPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [hint, setHint] = useState("")

    // UI
    const [passwordStrength, setPasswordStrength] = useState(-1)
    const [isCreating, setIsCreating] = useState(false)

    const [showViolationModal, setShowViolationModal] = useState(false)
    const [showConfirmCreateModal, setShowConfirmCreateModal] = useState<boolean>(false)
    const [violations, setViolations] = useState<string[]>([])

    const [encodeConfig, setEncodeConfig] = useState<Required<MPEncodeConfig>>({
      kdf: KdfType.PBKDF2_SHA256,
      kdf_iterations: 600000,
      kdf_memory: 64,
      kdf_parallelism: 5,
      kdf_version: 1,
    })

    // -------------- COMPUTED ------------------

    const isError = !!masterPassword && !!confirmPassword && masterPassword !== confirmPassword
    const isHintError = !isError && hint === masterPassword && !!hint
    const masterPasswordError = validateMasterPassword(masterPassword).error
    const isReady = !masterPasswordError && !isError && !!masterPassword && !!confirmPassword

    // -------------- METHODS ------------------
    const createMasterPasswordLoginType = async () => {
      await createMasterPasswordItem(masterPassword, passwordStrength)
    }
    // Logout
    const handleLogout = useCallback(async () => {
      await logout()
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: "init" },
            {
              name: "unAuthStack",
              params: { screen: "onBoarding" },
            },
          ],
        })
      )
    }, [logout, navigation])

    // Load teams to check master password policy
    const loadUserTeams = useCallback(async () => {
      await user.loadTeams()
    }, [user])

    // Prepare to create master pass
    const prepareToCreate = async () => {
      setIsCreating(true)

      const violatedItems = await checkPasswordPolicy(
        masterPassword,
        PolicyType.MASTER_PASSWORD_REQ
      )
      if (violatedItems.length) {
        setViolations(violatedItems)
        setShowViolationModal(true)
        setIsCreating(false)
        return
      }

      handleCreate()
    }

    console.log("CreateMasterPasswordScreen: render, encodeConfig: ", encodeConfig)

    // Confirm master pass
    const handleCreate = async () => {
      setIsCreating(true)
      setShowConfirmCreateModal(false)

      const res = await registerLocker(masterPassword, hint, passwordStrength, encodeConfig)
      if (res.kind === "ok") {
        logCreateMasterPwEvent()

        const sessionRes = await sessionLogin(
          encodeConfig,
          masterPassword,
          createMasterPasswordLoginType
        )
        setIsCreating(false)

        if (sessionRes.kind === "ok") {
          handleUnlock()
        } else {
          navigation.navigate("lock", {
            type: LockType.Individual,
          })
        }
      }
      setIsCreating(false)
    }

    const handleUnlock = async () => {
      const connectionState = await NetInfo.fetch()
      // Sync
      if (connectionState.isConnected) {
        await user.loadPlan()
      }
      Promise.all([loadFolders(), loadCollections(), loadOrganizations()])

      if (
        (!user.biometricIntroShown || uiStore.isStartFromPasswordLess) &&
        !user.isBiometricUnlock
      ) {
        uiStore.setStartFromPasswordLess(false)
        const available = await isBiometricAvailable()
        if (available) {
          navigation.replace("authStack", {
            screen: "homeStack",
            params: {
              screen: "biometricUnlockIntro",
            },
          })
          return
        }
      }

      navigation.replace("authStack", {
        screen: "mainTab",
        params: {
          screen: "homeTab",
        },
      })
    }

    // -------------- EFFECT ------------------

    // Mounted
    useEffect(() => {
      loadUserTeams()
    }, [loadUserTeams])

    useEffect(() => {
      const encryptionChange = EventBus.createListener(
        AppEventType.SELECT_ENCRYPTION_CONFIG,
        (config: Required<MPEncodeConfig>) => {
          setEncodeConfig(config)
        }
      )
      return () => {
        EventBus.removeListener(encryptionChange)
      }
    }, [])

    // Back handler
    useEffect(() => {
      const handleBack = (e: any) => {
        if (!["POP", "GO_BACK"].includes(e.data.action.type)) {
          navigation.dispatch(e.data.action)
          return
        }

        e.preventDefault()

        Alert.alert(translate("alert:logout") + user.email + "?", "", [
          {
            text: translate("common:cancel"),
            style: "cancel",
          },
          {
            text: translate("common:logout"),
            style: "destructive",
            onPress: handleLogout,
          },
        ])
      }
      navigation.addListener("beforeRemove", handleBack)
      return () => {
        navigation.removeListener("beforeRemove", handleBack)
      }
    }, [navigation])

    // -------------- RENDER ------------------

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["top", "bottom"]}
        contentContainerStyle={styles.container}
      >
        <PressableText
          text={translate("common:signout").toUpperCase()}
          color={colors.primary}
          onPress={handleLogout}
          weight="medium"
          size="md"
          style={styles.logout}
        />
        <View style={styles.center}>
          <Logo preset={"cystack-logo"} style={styles.logo} />

          <Text preset="bold" size="xl" style={styles.mb10} tx={"create_master_pass:title"} />

          <Text size="sm" preset="label" style={styles.centerText} tx={"create_master_pass:desc"} />

          <View style={themed($user)}>
            {!!user.avatar && (
              <Image resizeMode="contain" source={{ uri: user.avatar }} style={styles.avatar} />
            )}
            <Text size="sm" style={styles.email} text={user.email} />
          </View>

          <SetupEncryptionKeyOptions keyConfig={encodeConfig} style={styles.mt16} />

          {/* Master pass input */}
          <TextInput
            animated
            isPassword
            isError={isError || !!masterPasswordError}
            helper={masterPasswordError || translate("common:password_not_match")}
            label={translate("common:master_pass")}
            onChangeText={(text) => {
              setMasterPassword(text)
              const strength = getPasswordStrength(text)
              setPasswordStrength(strength ? strength.score : -1)
            }}
            value={masterPassword}
          />

          {!!masterPassword && (
            <Animated.View entering={FadeInUp} style={styles.passwordStrength}>
              <PasswordStrength value={passwordStrength} />
            </Animated.View>
          )}
          {/* Master pass input end */}

          {/* Master pass confirm */}
          <TextInput
            animated
            isPassword
            isError={isError}
            helperTx={"common:password_not_match"}
            labelTx={"create_master_pass:confirm_master_pass"}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
          />
          {/* Master pass confirm end */}

          {/* Hint */}
          <TextInput
            animated
            isError={isHintError}
            labelTx={"create_master_pass:hint"}
            onChangeText={setHint}
            value={hint}
            helperTx={"create_master_pass:hint_error"}
          />
          {/* Hint end */}

          {/* Bottom */}
          <>
            <Button
              disabled={isCreating || !isReady}
              loading={isCreating}
              tx={"create_master_pass:btn"}
              onPress={() => setShowConfirmCreateModal(true)}
              style={styles.button}
            />

            <Text
              preset="label"
              size="sm"
              style={styles.centerText}
              tx={"create_master_pass:note"}
            />
          </>
          {/* Bottom end */}

          {/* Confirm create password modal */}
          <ConfirmCreateMPModal
            isCreating={isCreating}
            isOpen={showConfirmCreateModal}
            onClose={() => setShowConfirmCreateModal(false)}
            onNext={() => prepareToCreate()}
          />

          {/* Violations modal */}
          <PasswordPolicyViolationsModal
            isOpen={showViolationModal}
            onClose={() => {
              setShowViolationModal(false)
            }}
            violations={violations}
            teamName={user.teams?.length > 0 ? user.teams[0]?.name : ""}
            onConfirm={() => {
              setShowViolationModal(false)
            }}
            confirmText="OK"
          />
          {/* Violations modal end */}
        </View>
      </Screen>
    )
  }
)

const $user: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginVertical: 16,
  marginHorizontal: 12,
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
  button: {
    marginVertical: 20,
    width: "100%",
  },
  center: {
    alignItems: "center",
  },
  centerText: {
    textAlign: "center",
  },
  container: {
    paddingHorizontal: 16,
  },
  email: {
    marginHorizontal: 10,
  },
  logo: { alignSelf: "center", height: 70, marginBottom: 10, width: 70 },
  logout: {
    marginTop: 12,
    textAlign: "right",
  },
  mb10: {
    marginBottom: 10,
  },
  mt16: {
    marginTop: 16,
    width: "100%",
  },
  passwordStrength: {
    marginTop: 16,
    width: "100%",
  },
})
