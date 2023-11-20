import React, { FC, useEffect, useState } from "react"
import { Alert, View, Image } from "react-native"
import { ConfirmCreateMPModal } from "./ConfirmCreateMpModal"
import { useStores } from "app/models"
import { PolicyType } from "app/static/types"
import { useTheme } from "app/services/context"
import { logCreateMasterPwEvent } from "app/utils/analytics"
import { useAuthentication, useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { Button, Header, Logo, Screen, Text, TextInput } from "app/components/cores"
import { PasswordPolicyViolationsModal, PasswordStrength } from "app/components/utils"
import Animated, { FadeInUp } from "react-native-reanimated"
import { observer } from "mobx-react-lite"
import { RootStackScreenProps } from "app/navigators/navigators.types"

export const CreateMasterPasswordScreen: FC<RootStackScreenProps<"createMasterPassword">> =
  observer((props) => {
    const navigation = props.navigation
    const { colors } = useTheme()
    const { user } = useStores()
    const { validateMasterPassword, translate } = useHelper()
    const { createMasterPasswordItem } = useCipherData()
    const { getPasswordStrength, checkPasswordPolicy } = useCipherHelper()
    const { logout, registerLocker, sessionLogin } = useAuthentication()

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

    // -------------- COMPUTED ------------------

    const isError = !!masterPassword && !!confirmPassword && masterPassword !== confirmPassword
    const masterPasswordError = validateMasterPassword(masterPassword).error
    const isReady = !masterPasswordError && !isError && !!masterPassword && !!confirmPassword

    // -------------- METHODS ------------------

    const createMasterPasswordLoginType = async () => {
      await createMasterPasswordItem(masterPassword, passwordStrength)
    }
    // Logout
    const handleLogout = async () => {
      await logout()
      navigation.navigate("login")
    }

    // Load teams to check master password policy
    const loadUserTeams = async () => {
      await user.loadTeams()
    }

    // Prepare to create master pass
    const prepareToCreate = async () => {
      setIsCreating(true)

      const violatedItems = await checkPasswordPolicy(
        masterPassword,
        PolicyType.MASTER_PASSWORD_REQ,
      )
      if (violatedItems.length) {
        setViolations(violatedItems)
        setShowViolationModal(true)
        setIsCreating(false)
        return
      }

      handleCreate()
    }

    // Confirm master pass
    const handleCreate = async () => {
      setIsCreating(true)
      setShowConfirmCreateModal(false)

      const res = await registerLocker(masterPassword, hint, passwordStrength)
      if (res.kind === "ok") {
        logCreateMasterPwEvent()
        const sessionRes = await sessionLogin(masterPassword, createMasterPasswordLoginType)

        if (sessionRes.kind === "ok") {
          setIsCreating(false)
          navigation.navigate("mainStack")
        } else {
          navigation.navigate("lock")
        }
      }
      setIsCreating(false)
    }

    // -------------- EFFECT ------------------

    // Mounted
    useEffect(() => {
      loadUserTeams()
    }, [])

    // Back handler
    useEffect(() => {
      const handleBack = (e) => {
        if (!["POP", "GO_BACK"].includes(e.data.action.type)) {
          navigation.dispatch(e.data.action)
          return
        }

        e.preventDefault()

        Alert.alert(translate("alert.logout") + user.email + "?", "", [
          {
            text: translate("common.cancel"),
            style: "cancel",
          },
          {
            text: translate("common.logout"),
            style: "destructive",
            onPress: async () => {
              await logout()
              navigation.navigate("login")
            },
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
        padding
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={
          <Header
            rightText={translate("common.logout").toUpperCase()}
            rightTextColor={colors.primary}
            onRightPress={handleLogout}
          />
        }
      >
        <View style={{ alignItems: "center" }}>
          <Logo preset="default" style={{ height: 73, width: 63 }} />

          <Text
            preset="bold"
            size="xl"
            style={{ marginBottom: 10, marginTop: 25 }}
            text={translate("create_master_pass.title")}
          />

          <Text
            size="base"
            preset="label"
            style={{ textAlign: "center" }}
            text={translate("create_master_pass.desc")}
          />

          {/* Current user */}
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
              <View style={{ borderRadius: 14, overflow: "hidden" }}>
                <Image
                  resizeMode="contain"
                  source={{ uri: user.avatar }}
                  style={{
                    height: 28,
                    width: 28,
                    backgroundColor: colors.white,
                  }}
                />
              </View>
            )}
            <Text
              size="base"
              style={{
                marginHorizontal: 10,
              }}
            >
              {user.email}
            </Text>
          </View>

          {/* Master pass input */}
          <TextInput
            animated
            isPassword
            isError={isError || !!masterPasswordError}
            helper={masterPasswordError || translate("common.password_not_match")}
            label={translate("common.master_pass")}
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
          {/* Master pass input end */}

          {/* Master pass confirm */}
          <TextInput
            animated
            isPassword
            isError={isError}
            helper={translate("common.password_not_match")}
            label={translate("create_master_pass.confirm_master_pass")}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
          />
          {/* Master pass confirm end */}

          {/* Hint */}
          <TextInput
            animated
            label={translate("create_master_pass.hint")}
            onChangeText={setHint}
            value={hint}
          />
          {/* Hint end */}

          {/* Bottom */}
          <>
            <Button
              disabled={isCreating || !isReady}
              loading={isCreating}
              text={translate("create_master_pass.btn")}
              onPress={() => setShowConfirmCreateModal(true)}
              style={{
                width: "100%",
                marginVertical: 20,
              }}
            />

            <Text
              preset="label"
              size="base"
              style={{ textAlign: "center" }}
              text={translate("create_master_pass.note")}
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
            teamName={user.teams.length && user.teams[0]?.name}
            onConfirm={() => {
              setShowViolationModal(false)
            }}
            confirmText="OK"
          />
          {/* Violations modal end */}
        </View>
      </Screen>
    )
  })
