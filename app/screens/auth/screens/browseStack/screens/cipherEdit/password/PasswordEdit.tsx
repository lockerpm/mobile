import { useState, useCallback, useEffect } from "react"
import {
  BackHandler,
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  Alert,
} from "react-native"
import { observer } from "mobx-react-lite"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

import {
  CipherIconImage,
  CipherOthersInfo,
  CustomFieldsEdit,
  DynamicUris,
  PasswordOtp,
} from "app/components/ciphers"
import { Header, Screen, TextInput, Text, Icon } from "app/components/cores"
import { PasswordPolicyViolationsModal, PasswordStrength } from "app/components/utils"
import { useStores } from "app/models"
import { BrowseScreenProps } from "app/navigators"
import { useCipherData, useCipherHelper, useFolder } from "app/services/hook"
import { CipherAppView, CipherEditHelperModal, CipherEditMode } from "app/static/types"
import { CipherView, FieldView, LoginUriView, LoginView } from "core/models/view"
import { CollectionView } from "core/models/view/collectionView"
import { Fido2CredentialView } from "core/models/view/fido2CredentialView"
import { FolderView } from "core/models/view/folderView"

import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { AndroidAFSavePassword } from "@/utils/autofill.android"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { formatDate } from "@/utils/formatDate"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  item: CipherAppView
  mode: CipherEditMode
  navigation: BrowseScreenProps<"cipherEdit">["navigation"]

  // other common info
  folder?: FolderView
  collection?: CollectionView
  collectionIds: string[]
  organizationId: string | null

  isOwner: boolean

  // autofill android service
  initialUrl?: string
  androidAutofillSavedData?: AndroidAFSavePassword
}

export const PasswordEdit = observer(
  ({
    navigation,
    mode,
    item,
    collection,
    folder,
    organizationId,
    collectionIds,
    isOwner,
    initialUrl,
    androidAutofillSavedData: saveData,
  }: Props) => {
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { translate } = useAppLocale()
    const { shareFolderAddItem } = useFolder()
    const { createCipher, updateCipher } = useCipherData()
    const { getPasswordStrength, checkPasswordPolicy } = useCipherHelper()
    const { user } = useStores()

    // ----------------- COMPUTED ------------------
    const onSaveFillService = !!saveData

    // ----------------- PARAMS ------------------

    const [isLoading, setIsLoading] = useState(false)
    const [violationsConfig, setViolationsConfig] = useState<{
      violations: string[]
      pendingPayload: {
        item: CipherView
        strength: number
      }
    } | null>(null)

    // Forms
    const [name, setName] = useState(
      onSaveFillService ? saveData.url?.replace("https://", "") : item.name
    )
    const [username, setUsername] = useState(
      onSaveFillService ? saveData.username : item.login.username
    )
    const [password, setPassword] = useState(
      onSaveFillService ? saveData.password : item.login.password
    )
    const [totp, setTotp] = useState(item.login.totp)

    const [urls, setUrls] = useState(
      onSaveFillService
        ? [saveData.url]
        : item.login.uris?.length > 0
          ? item.login.uris.map((e) => e.uri)
          : [initialUrl || "https://"]
    )

    const [fido2, setFido2] = useState<Fido2CredentialView[] | null>(item.login.fido2Credentials) // fido2

    // other
    const [fields, setFields] = useState<FieldView[]>(item.fields ?? [])
    const [note, setNote] = useState(item.notes) // custom note

    // ----------------- METHODS ------------------

    // Go back
    const handleBack = useCallback(() => {
      if (onSaveFillService) {
        BackHandler.exitApp()
      } else {
        navigation.goBack()
      }
    }, [])

    const removeFido = () => {
      Alert.alert(
        translate("password:fido2.delete_alert.title"),
        translate("password:fido2.delete_alert.desc"),
        [
          {
            text: translate("common:cancel"),
            style: "cancel",
          },
          {
            text: translate("password:fido2.delete_alert.btn"),
            style: "destructive",
            onPress: () => {
              setFido2(null)
              preparePassword()
            },
          },
        ]
      )
    }

    const navigatePlanStorageLimit = useCallback(() => {
      navigation.navigate("cipherEditHelperModal", {
        mode: CipherEditHelperModal.PLAN_STORAGE_LIMIT,
      })
    }, [navigation])

    const navigateToPasswordOtp = useCallback(() => {
      navigation.navigate("otpSelect", {
        selectedOtp: totp,
      })
    }, [navigation, totp])

    const navigateGeneratePassword = useCallback(() => {
      navigation.navigate("cipherEditHelperModal", {
        mode: CipherEditHelperModal.GENERATE_PASSWORD,
      })
    }, [navigation])

    const navigateHideEmail = useCallback(() => {
      navigation.navigate("cipherEditHelperModal", {
        mode: CipherEditHelperModal.HIDE_EMAIL,
      })
    }, [navigation])

    // Prepare to save password
    const preparePassword = async () => {
      // @ts-ignore
      const payload: CipherView = {
        ...item,
      }

      const data = new LoginView()
      data.username = username
      data.password = password
      data.totp = totp
      const nonnullUrls = urls.filter((u) => u.trim())
      if (nonnullUrls.length > 0) {
        const uriData: LoginUriView[] = []
        nonnullUrls.forEach((u) => {
          const uriView = new LoginUriView()
          uriView.uri = u
          uriData.push(uriView)
        })
        data.uris = uriData
      }

      payload.fields = fields.filter((f) => !!f.value && f.value.trim())
      payload.name = name
      payload.notes = note
      payload.folderId = folder?.id || ""
      payload.login = data
      payload.organizationId = organizationId as string
      const passwordStrength = getPasswordStrength(password).score

      // Violate team's policy
      if (isOwner) {
        setIsLoading(true)
        const violatedItems = await checkPasswordPolicy(password)
        if (violatedItems.length) {
          setViolationsConfig({
            violations: violatedItems,
            pendingPayload: {
              item: payload,
              strength: passwordStrength,
            },
          })
          setIsLoading(false)
          return
        }
      }

      // Ok
      handleSave(payload, passwordStrength)
    }

    // Save password
    const handleSave = async (payload: CipherView, passwordStrength: number) => {
      setIsLoading(true)
      let res = { kind: "unknown" }

      if (["add", "clone"].includes(mode)) {
        res = await createCipher(payload, passwordStrength, collectionIds)
      } else {
        res = await updateCipher(payload.id, payload, passwordStrength, collectionIds)
      }
      if (res.kind === "ok") {
        if (isOwner && collection) {
          await shareFolderAddItem(collection, payload)
        }
        setIsLoading(false)
        handleBack()
      } else {
        setIsLoading(false)

        // reach limit plan stogare
        // @ts-ignore
        if (res?.data?.code === "5002") {
          navigatePlanStorageLimit()
        }
      }
      setViolationsConfig(null)
    }

    // ----------------- EFFECT ------------------

    useEffect(() => {
      const listener1 = EventBus.createListener(
        AppEventType.CIPHER_EDIT_HIDE_EMAIL,
        (email: string) => {
          setUsername(email)
        }
      )

      const listener2 = EventBus.createListener(
        AppEventType.CIPHER_EDIT_GENERATE_PASSWORD,
        (password: string) => {
          setPassword(password)
        }
      )

      const listener3 = EventBus.createListener(
        AppEventType.CIPHER_EDIT_OTP_SELECT,
        (totp: string) => {
          setTotp(totp)
        }
      )

      return () => {
        EventBus.removeListener(listener1)
        EventBus.removeListener(listener2)
        EventBus.removeListener(listener3)
      }
    }, [])
    // ----------------- RENDER ------------------

    const UsernameAccessory = useCallback(
      ({ style }: { style?: ViewStyle }) => (
        <TouchableOpacity onPress={navigateHideEmail} style={[style, styles.accessory]}>
          <Text preset="bold" color={colors.primary} size="sm" tx={"password:hide_email.title"} />
          <Icon icon="arrow-right" size={18} color={colors.primary} style={styles.mt2} />
        </TouchableOpacity>
      ),
      [colors.primary, navigateHideEmail]
    )

    const PasswordAccessory = useCallback(
      ({ style }: { style?: ViewStyle }) => (
        <TouchableOpacity onPress={navigateGeneratePassword} style={[style, styles.accessory]}>
          <Text preset="bold" color={colors.primary} tx={"common:generate"} />
          <Icon icon="arrow-clockwise" size={18} color={colors.primary} style={styles.mt2} />
        </TouchableOpacity>
      ),
      [colors.primary, navigateGeneratePassword]
    )

    return (
      <Screen
        preset="auto"
        header={
          <Header
            titleTx={mode === "add" ? "common:add" : "common:edit"}
            onLeftPress={handleBack}
            leftTx={"common:cancel"}
            rightTx="common:save"
            rightIconColor={colors.primary}
            rightLoading={isLoading}
            rightDisabled={isLoading || !name.trim()}
            onRightPress={preparePassword}
          />
        }
        ScrollViewProps={{
          contentContainerStyle: styles.scrollContainer,
        }}
      >
        <View style={styles.header}>
          <View style={styles.row}>
            <CipherIconImage
              isHaveKey={item.login.hasFido2Credentials}
              cipherType={item.type}
              resizeMode="contain"
              source={item.imgLogo}
              style={themed($image)}
            />
            <View style={styles.flex}>
              <TextInput
                animated
                isRequired
                labelTx={"common:item_name"}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        </View>
        {/* Name end */}

        <View style={themed($block)}>
          <Text preset="label" size="sm" tx="password:login_details" />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <TextInput
            animated
            labelTx={"password:username"}
            value={username}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setUsername}
          />
          <UsernameAccessory style={styles.accessoryContainer} />

          <TextInput
            isPassword
            animated
            labelTx={"common:password"}
            value={password}
            onChangeText={setPassword}
          />
          <View style={styles.passwordActions}>
            <View style={styles.passwordStrength}>
              {!!password && (
                <PasswordStrength
                  preset="text"
                  value={getPasswordStrength(password).score}
                  width={150}
                />
              )}
            </View>

            <PasswordAccessory />
          </View>

          <DynamicUris fields={urls} setFields={setUrls} />
        </View>

        {/** Passkey section */}
        {fido2 && fido2.length > 0 && fido2[0].creationDate?.getTime() && (
          <>
            <View style={themed($block)}>
              <Text preset="label" size="sm" text={"Passkey"} />
            </View>

            <TouchableOpacity onPress={removeFido}>
              <View style={styles.totp}>
                <Text
                  text={
                    translate("common:createdAt") + formatDate(fido2[0].creationDate?.getTime())
                  }
                />

                <Icon icon="trash" size={20} color={colors.error} />
              </View>
            </TouchableOpacity>
          </>
        )}

        <View style={themed($block)}>
          <Text preset="label" size="sm" tx={"password:2fa_setup"} />
        </View>

        <TouchableOpacity onPress={navigateToPasswordOtp}>
          <View style={styles.totp}>
            {!totp && (
              <View style={styles.row2}>
                <Icon icon="authenticator" size={20} color={colors.primary} />
                <Text tx={"password:add_otp"} color={colors.primary} style={styles.ml12} />
              </View>
            )}

            {totp && <PasswordOtp data={totp} />}

            <Icon icon="caret-right" size={20} color={colors.label} />
          </View>
        </TouchableOpacity>

        <PasswordPolicyViolationsModal
          isOpen={!!violationsConfig}
          onClose={() => {
            setViolationsConfig(null)
          }}
          violations={violationsConfig?.violations ?? []}
          teamName={user.teams.length > 0 ? user.teams[0]?.name : ""}
          onConfirm={async () => {
            if (violationsConfig) {
              await handleSave(
                violationsConfig.pendingPayload.item,
                violationsConfig.pendingPayload.strength
              )
            }
          }}
          confirmText={translate("policy:password_violation_modal.use_anyway")}
        />

        <CustomFieldsEdit fields={fields} setFields={setFields} />

        <CipherOthersInfo
          isOwner={isOwner}
          hasNote={true}
          note={note}
          onChangeNote={setNote}
          folder={folder}
          collection={collection}
          isDeleted={item.isDeleted}
        />
      </Screen>
    )
  }
)

const $block: ThemedStyle<ViewStyle> = ({ colors }) => ({
  padding: 16,
  paddingVertical: 8,
  backgroundColor: colors.block,
})

const $image: ThemedStyle<ImageStyle> = ({ colors }) => ({
  height: 40,
  marginRight: 10,
  marginTop: 20,
  width: 40,
  borderRadius: 8,
  backgroundColor: colors.block,
})

const styles = StyleSheet.create({
  accessory: {
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 8,
  },
  accessoryContainer: {
    alignSelf: "flex-end",
    marginBottom: -16,
    padding: 12,
    paddingRight: 0,
    zIndex: 2,
  },
  flex: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 0,
  },
  image: { height: 50, marginRight: 10, marginTop: 26, width: 50 },
  info: {
    padding: 16,
    paddingTop: 0,
  },
  ml12: { marginLeft: 12 },
  ml7: { marginLeft: 7 },
  mt15: {
    marginTop: 15,
  },
  mt2: {
    marginLeft: 4,
    marginTop: 2,
  },
  mt8: {
    marginTop: 8,
  },

  passwordActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: -16,
    padding: 12,
    paddingRight: 0,
    zIndex: 2,
  },
  passwordStrength: {
    alignItems: "flex-start",
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: -5,
    marginTop: -5,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  row2: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  scrollContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
  totp: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
})
