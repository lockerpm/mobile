import React, { useState, useEffect, FC } from "react"
import { observer } from "mobx-react-lite"
import { BackHandler, TouchableOpacity, View, Image } from "react-native"
import find from "lodash/find"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { AppStackScreenProps } from "app/navigators/navigators.types"
import { useTheme } from "app/services/context"
import { useCipherData, useCipherHelper, useFolder, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { CollectionView } from "core/models/view/collectionView"
import { CipherView, FieldView, LoginUriView, LoginView } from "core/models/view"
import { CipherType } from "core/enums"
import { Button, Header, Screen, TextInput, Text, Icon } from "app/components/cores"
import { PasswordPolicyViolationsModal, PasswordStrength } from "app/components/utils"
import { CipherOthersInfo, CustomFieldsEdit } from "app/components/ciphers"
import { PasswordOtp } from "./Otp"

export const PasswordEditScreen: FC<AppStackScreenProps<"passwords__edit">> = observer((props) => {
  const navigation = props.navigation
  const route = props.route
  const { mode, initialUrl } = route.params

  const { colors } = useTheme()
  const { shareFolderAddItem } = useFolder()
  const { translate } = useHelper()
  const { createCipher, updateCipher } = useCipherData()
  const { getPasswordStrength, newCipher, checkPasswordPolicy } = useCipherHelper()
  const { cipherStore, uiStore, user, collectionStore } = useStores()

  // ----------------- COMPUTED ------------------
  const selectedCollection: CollectionView = route.params.collection

  const selectedCipher: CipherView = cipherStore.cipherView
  const onSaveFillService = uiStore.isOnSaveLogin
  const isOwner = (() => {
    if (!selectedCipher.organizationId) {
      return true
    }
    const org = cipherStore.myShares.find(
      (s) => s.organization_id === selectedCipher.organizationId,
    )
    return !!org
  })()

  // ----------------- PARAMS ------------------

  const [isLoading, setIsLoading] = useState(false)
  const [showViolationModal, setShowViolationModal] = useState(false)
  const [violations, setViolations] = useState<string[]>([])
  const [pendingPayload, setPendingPayload] = useState<{
    item: CipherView
    strength: number
  }>(null)

  // Forms
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [totp, setTotp] = useState("")
  const [url, setUrl] = useState("")
  const [note, setNote] = useState("")
  const [folder, setFolder] = useState(null)
  const [collection, setCollection] = useState(null)
  const [organizationId, setOrganizationId] = useState(null)
  const [collectionIds, setCollectionIds] = useState([])
  const [fields, setFields] = useState<FieldView[]>([])

  // ----------------- EFFECTS ------------------
  // Set initial data
  useEffect(() => {
    if (mode !== "add") {
      setName(selectedCipher.name)
      setUsername(selectedCipher.login.username)
      setPassword(selectedCipher.login.password)
      setTotp(selectedCipher.login.totp)
      setUrl(selectedCipher.login.uri)
      setNote(selectedCipher.notes)
      setFolder(selectedCipher.folderId)
      setCollection(
        selectedCipher.collectionIds.length > 0 ? selectedCipher.collectionIds[0] : null,
      )
      setOrganizationId(mode === "clone" ? null : selectedCipher.organizationId)
      setCollectionIds(selectedCipher.collectionIds)
      setFields(selectedCipher.fields || [])
    } else {
      setUrl(initialUrl || "https://")
    }
  }, [])

  // Set initial data if open from autofill
  useEffect(() => {
    if (onSaveFillService) {
      const saveData = uiStore.saveLogin
      setUsername(saveData.username)
      setPassword(saveData.password)
      setUrl(saveData.domain)
      setName(saveData.domain?.replace("https://", ""))
    }
  }, [])

  // Set generated password/folder from generator
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (cipherStore.generatedPassword) {
        setPassword(cipherStore.generatedPassword)
        cipherStore.setGeneratedPassword("")
      }

      if (cipherStore.selectedFolder) {
        if (cipherStore.selectedFolder === "unassigned") {
          setFolder(null)
        } else {
          if (!selectedCollection) setFolder(cipherStore.selectedFolder)
        }
        setCollection(null)
        setCollectionIds([])
        setOrganizationId(null)
        cipherStore.setSelectedFolder(null)
      }

      if (cipherStore.selectedTotp) {
        setTotp(cipherStore.selectedTotp === "-1" ? "" : cipherStore.selectedTotp)
        cipherStore.setSelectedTotp("")
      }

      if (cipherStore.selectedCollection) {
        if (!selectedCollection) setCollection(cipherStore.selectedCollection)
        setFolder(null)
        cipherStore.setSelectedCollection(null)
      }
    })

    return unsubscribe
  }, [navigation])

  // ----------------- METHODS ------------------

  // Go back
  const handleBack = () => {
    if (onSaveFillService) {
      uiStore.setIsOnSaveLogin(false)
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
    payload.folderId = folder
    payload.login = data
    payload.organizationId = organizationId
    const passwordStrength = getPasswordStrength(password).score

    // Violate team's policy
    if (isOwner) {
      setIsLoading(true)
      const violatedItems = await checkPasswordPolicy(password)
      if (violatedItems.length) {
        setPendingPayload({
          item: payload,
          strength: passwordStrength,
        })
        setViolations(violatedItems)
        setShowViolationModal(true)
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
        // for shared folder
        if (selectedCollection) {
          await shareFolderAddItem(selectedCollection, payload)
        }

        if (collection) {
          const collectionView = find(collectionStore.collections, (e) => e.id === collection) || {}
          await shareFolderAddItem(collectionView, payload)
        }
      }
      setIsLoading(false)
      handleBack()
    } else {
      setIsLoading(false)
    }
  }

  // ----------------- RENDER ------------------

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
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
    >
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
        <Text preset="label" size="base" text={translate("password.login_details").toUpperCase()} />
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

        <TextInput
          isPassword
          animated
          label={translate("common.password")}
          value={password}
          onChangeText={setPassword}
        />

        {!!password && (
          <PasswordStrength value={getPasswordStrength(password).score} style={{ marginTop: 15 }} />
        )}
        {/* Password end */}

        <TouchableOpacity
          onPress={() => navigation.navigate("passwordGenerator")}
          style={{
            marginTop: 16,
          }}
        >
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon icon="repeat" size={20} color={colors.primary} />
              <Text
                preset="bold"
                color={colors.primary}
                text={translate("common.generate")}
                style={{ marginLeft: 7 }}
              />
            </View>
            <Icon icon="caret-right" size={20} />
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
        onPress={() =>
          navigation.navigate("passwords_2fa_setup", {
            mode,
          })
        }
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

      <CustomFieldsEdit fields={fields} setFields={setFields} />

      <CipherOthersInfo
        isOwner={isOwner}
        navigation={navigation}
        hasNote
        note={note}
        onChangeNote={setNote}
        folderId={folder}
        collectionId={collection}
        organizationId={organizationId}
        setOrganizationId={setOrganizationId}
        collectionIds={collectionIds}
        setCollectionIds={setCollectionIds}
        isDeleted={selectedCipher.isDeleted}
      />

      <PasswordPolicyViolationsModal
        isOpen={showViolationModal}
        onClose={() => {
          setShowViolationModal(false)
        }}
        violations={violations}
        teamName={user.teams.length && user.teams[0]?.name}
        onConfirm={() => {
          setShowViolationModal(false)
          handleSave(pendingPayload.item, pendingPayload.strength)
        }}
        confirmText={translate("policy.password_violation_modal.use_anyway")}
      />
    </Screen>
  )
})
