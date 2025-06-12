import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { BackHandler, TouchableOpacity, View, Image, StyleSheet } from "react-native"
import find from "lodash/find"
import { useAppLocale, useTheme } from "app/services/context"
import { useCipherData, useCipherHelper, useFolder } from "app/services/hook"
import { useStores } from "app/models"
import { CollectionView } from "core/models/view/collectionView"
import { CipherView, FieldView, LoginUriView, LoginView } from "core/models/view"
import { CipherType } from "core/enums"
import { Button, Header, Screen, TextInput, Text, Icon } from "app/components/cores"
import { PlanStorageLimitModal } from "../planStorageLimitModal"
import { PasswordPolicyViolationsModal, PasswordStrength } from "app/components/utils"
import { PasswordOtp } from "./passwords/Otp"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { CommonActions } from "@react-navigation/native"
import { PrivateEmailModal } from "./passwords/privateEmailModal/PrivateEmail"
import { BrowseStackScreenProps } from "app/navigators"
import { CipherAppView, CipherEditMode } from "app/static/types"
import { AndroidAutofillServiceData } from "app/utils/autofillHelper"
import { CipherOthersInfo, CustomFieldsEdit } from "app/components/newCiphers"
import { FolderView } from "core/models/view/folderView"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

type Props = {
  item: CipherAppView
  mode: CipherEditMode
  navigation: BrowseStackScreenProps<"cipherEdit">["navigation"]

  // other common info
  folder?: FolderView
  collection?: CollectionView
  collectionIds: string[]
  organizationId: string

  isOwner: boolean

  // autofill android service
  initialUrl?: string
  androidAutofillSavedData?: AndroidAutofillServiceData
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
    androidAutofillSavedData,
  }: Props) => {
    const { colors } = useTheme()
    const { shareFolderAddItem } = useFolder()
    const { translate } = useAppLocale()
    const { createCipher, updateCipher } = useCipherData()
    const { getPasswordStrength, newCipher, checkPasswordPolicy } = useCipherHelper()
    const { user, collectionStore, uiStore } = useStores()

    // ----------------- COMPUTED ------------------
    const selectedCipher: CipherAppView = item

    const onSaveFillService = !!androidAutofillSavedData

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
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [totp, setTotp] = useState("")
    const [url, setUrl] = useState("")

    // other
    const [fields, setFields] = useState<FieldView[]>(item.fields)
    const [note, setNote] = useState("") // custom note for the cipher, not use in CipherType SecureNote

    // plan storage limit modal
    const [isOpenModal, setIsOpenModal] = useState(false)
    const [isOpenPrivateEmailsModal, setIsOpenPrivateEmailsModal] = useState(false)

    // ----------------- EFFECTS ------------------
    // Set initial data
    useEffect(() => {
      if (mode !== "add") {
        setName(selectedCipher.name)
        setUsername(selectedCipher.login.username)
        setPassword(selectedCipher.login.password)
        setTotp(selectedCipher.login.totp)
        setUrl(selectedCipher.login.uri)
      } else {
        setUrl(initialUrl || "https://")
      }
    }, [])

    // Set initial data if open from autofill
    useEffect(() => {
      if (onSaveFillService) {
        const saveData = androidAutofillSavedData
        setUsername(saveData.username)
        setPassword(saveData.password)
        setUrl(saveData.domain)
        setName(saveData.domain?.replace("https://", ""))
      }
    }, [])

    // Set generated password/folder from generator
    // useEffect(() => {
    //   const unsubscribe = navigation.addListener("focus", () => {
    //     if (cipherStore.generatedPassword) {
    //       setPassword(cipherStore.generatedPassword)
    //       cipherStore.setGeneratedPassword("")
    //     }

    //     if (cipherStore.selectedFolder) {
    //       if (cipherStore.selectedFolder === "unassigned") {
    //         setFolder(null)
    //       } else {
    //         if (!selectedCollection) setFolder(cipherStore.selectedFolder)
    //       }
    //       setCollection(null)
    //       setCollectionIds([])
    //       setOrganizationId(null)
    //       cipherStore.setSelectedFolder(null)
    //     }

    //     if (cipherStore.selectedTotp) {
    //       setTotp(cipherStore.selectedTotp === "-1" ? "" : cipherStore.selectedTotp)
    //       cipherStore.setSelectedTotp("")
    //     }

    //     if (cipherStore.selectedCollection) {
    //       if (!selectedCollection) setCollection(cipherStore.selectedCollection)
    //       setFolder(null)
    //       cipherStore.setSelectedCollection(null)
    //     }
    //   })

    //   return unsubscribe
    // }, [navigation])

    // ----------------- METHODS ------------------

    // Go back
    const handleBack = () => {
      if (onSaveFillService) {
        uiStore.setAndroidAutofillServiceData(false, null)
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "init" }],
          }),
        )
        BackHandler.exitApp()
      } else {
        navigation.goBack()
      }
    }

    // Prepare to save password
    const preparePassword = async () => {
      let payload: CipherView
      if (mode === "add") {
        payload = newCipher(CipherType.Login)
      } else {
        // @ts-ignore
        payload = { ...selectedCipher }
      }

      const data = new LoginView()
      data.username = username
      data.password = password
      data.totp = totp
      if (url) {
        const uriView = new LoginUriView()
        uriView.uri = url
        data.uris = [uriView]
      }

      payload.fields = fields
      payload.name = name
      payload.notes = note
      payload.folderId = folder?.id ?? ""
      payload.login = data
      payload.organizationId = organizationId
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
        if (isOwner) {
          if (collection) {
            const collectionView =
              find(collectionStore.collections, (e) => e.id === collection) || {}
            await shareFolderAddItem(collectionView, payload)
          }
        }
        setIsLoading(false)
        handleBack()
      } else {
        setIsLoading(false)

        // reach limit plan stogare
        // @ts-ignore
        if (res?.data?.code === "5002") {
          setIsOpenModal(true)
        }
      }
      setViolationsConfig(null)
    }

    // ----------------- RENDER ------------------

    return (
      <Screen
        preset="auto"
        header={
          <Header
            title={
              mode === "add"
                ? `${translate("common.add")} ${translate("common.password")}`
                : translate("common.edit")
            }
            onLeftPress={() => {
              handleBack()
            }}
            leftText={translate("common.cancel")}
            RightActionComponent={
              <Button
                loading={isLoading}
                disabled={isLoading || !name.trim()}
                preset="teriatary"
                text={translate("common.save")}
                onPress={preparePassword}
              />
            }
          />
        }
        ScrollViewProps={{
          contentContainerStyle: styles.scrollContainer,
        }}
      >
        <PlanStorageLimitModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} />
        <PrivateEmailModal
          isOpen={isOpenPrivateEmailsModal}
          onClose={() => setIsOpenPrivateEmailsModal(false)}
          onSelectEmail={(val: string) => {
            setUsername(val)
            setIsOpenPrivateEmailsModal(false)
          }}
        />

        <View style={{ padding: 16, paddingTop: 0 }}>
          <View style={{ flexDirection: "row" }}>
            <Image
              resizeMode="contain"
              source={BROWSE_ITEMS.password.icon}
              style={{ height: 50, width: 50, marginRight: 10, marginTop: 25 }}
            />
            <View style={{ flex: 1 }}>
              <TextInput
                animated
                isRequired
                label={translate("common.item_name")}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        </View>
        {/* Name end */}

        <View style={{ padding: 16, backgroundColor: colors.block }}>
          <Text
            preset="label"
            size="base"
            text={translate("password.login_details").toUpperCase()}
          />
        </View>

        {/* Info */}
        <View
          style={{
            paddingBottom: 32,
            padding: 16,
            paddingTop: 0,
          }}
        >
          <TextInput
            animated
            label={translate("password.username")}
            value={username}
            onChangeText={setUsername}
          />

          <TouchableOpacity
            onPress={() => setIsOpenPrivateEmailsModal(true)}
            style={{
              marginTop: 8,
              alignItems: "flex-end",
            }}
          >
            <Text
              preset="bold"
              color={colors.primary}
              text={translate("password.hide_email.title")}
              style={{ marginLeft: 7 }}
            />
          </TouchableOpacity>

          <TextInput
            isPassword
            animated
            label={translate("common.password")}
            value={password}
            onChangeText={setPassword}
          />

          {!!password && (
            <PasswordStrength
              value={getPasswordStrength(password).score}
              style={{ marginTop: 15 }}
            />
          )}
          {/* Password end */}

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate("passwordGenerator")
            }}
            style={{
              marginTop: 8,
            }}
          >
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                preset="bold"
                color={colors.primary}
                text={translate("common.generate")}
                style={{ marginLeft: 7 }}
              />
            </View>
          </TouchableOpacity>

          <TextInput
            animated
            label={translate("password.website_url")}
            value={url}
            onChangeText={setUrl}
            onBlur={() => {
              if (mode === "add" && !name) {
                const genName = url.replace("https://", "")
                setName(genName)
              }
            }}
          />
        </View>

        <View style={{ padding: 16, backgroundColor: colors.block }}>
          <Text preset="label" size="base" text={translate("password.2fa_setup").toUpperCase()} />
        </View>

        <TouchableOpacity
          onPress={() => {
            // navigation.navigate("passwords_2fa_setup", {
            //   mode,
            // })
          }}
        >
          <View
            style={{
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {!totp ? <Text text={translate("password.add_otp")} /> : <PasswordOtp data={totp} />}

            <Icon icon="caret-right" size={20} />
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
                violationsConfig.pendingPayload.strength,
              )
            }
          }}
          confirmText={translate("policy.password_violation_modal.use_anyway")}
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
  },
)

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
})
