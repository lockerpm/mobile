import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { BackHandler, TouchableOpacity, View } from "react-native"
import find from "lodash/find"
import {
  AutoImage as Image,
  Text,
  Layout,
  Button,
  Header,
  FloatingInput,
  CipherOthersInfo,
  PasswordStrength,
  CustomFieldsEdit,
  PasswordPolicyViolationsModal,
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherType } from "../../../../../../core/enums"
import { CipherView, FieldView, LoginUriView, LoginView } from "../../../../../../core/models/view"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { useFolderMixins } from "../../../../../services/mixins/folder"
import { PlanStorageLimitModal } from "../../plan-storage-limit-modal"
import { PasswordOtp } from "./otp"

type PasswordEditScreenProp = RouteProp<PrimaryParamList, "passwords__edit">

export const PasswordEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<PasswordEditScreenProp>()
  const { mode, initialUrl } = route.params
  const { translate, color } = useMixins()

  const { shareFolderAddItem } = useFolderMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const { getPasswordStrength, newCipher, checkPasswordPolicy } = useCipherHelpersMixins()
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

  // plan storage limit modal
  const [isOpenModal, setIsOpenModal] = useState(false)

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
        setTotp(cipherStore.selectedTotp === "-1" ?  '' : cipherStore.selectedTotp )
        cipherStore.setSelectedTotp('')
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

      // reach limit plan stogare
      // @ts-ignore
      if (res?.data?.code === "5002") {
        setIsOpenModal(true)
      }
    }
  }

  // ----------------- RENDER ------------------

  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
      }}
      header={
        <Header
          title={
            mode === "add"
              ? `${translate("common.add")} ${translate("common.password")}`
              : translate("common.edit")
          }
          goBack={() => {
            handleBack()
          }}
          goBackText={translate("common.cancel")}
          right={
            <Button
              isLoading={isLoading}
              isDisabled={isLoading || !name.trim()}
              preset="link"
              text={translate("common.save")}
              onPress={preparePassword}
              style={{
                height: 35,
                alignItems: "center",
                paddingLeft: 10,
              }}
              textStyle={{
                fontSize: fontSize.p,
              }}
            />
          }
        />
      }
    >
      <PlanStorageLimitModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} />
      {/* Name */}
      <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}>
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Image
            source={BROWSE_ITEMS.password.icon}
            style={{ height: 40, width: 40, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <FloatingInput
              isRequired
              label={translate("common.item_name")}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>
      {/* Name end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate("password.login_details").toUpperCase()}
          style={{ fontSize: fontSize.small }}
        />
      </View>

      {/* Info */}
      <View
        style={[
          commonStyles.SECTION_PADDING,
          {
            backgroundColor: color.background,
            paddingBottom: 32,
          },
        ]}
      >
        {/* Username */}
        <View style={{ flex: 1 }}>
          <FloatingInput
            label={translate("password.username")}
            value={username}
            onChangeText={setUsername}
          />
        </View>
        {/* Username end */}

        {/* Password */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            isPassword
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
        </View>
        {/* Password end */}

        {/* Generate password */}
        <Button
          preset="link"
          onPress={() => navigation.navigate("passwordGenerator")}
          style={{
            marginTop: 20,
          }}
        >
          <View
            style={[
              commonStyles.CENTER_HORIZONTAL_VIEW,
              {
                justifyContent: "space-between",
                width: "100%",
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesomeIcon name="repeat" size={18} color={color.primary} />
              <Text
                preset="green"
                text={translate("common.generate")}
                style={{ fontSize: fontSize.small, marginLeft: 7 }}
              />
            </View>
            <FontAwesomeIcon name="angle-right" size={20} color={color.text} />
          </View>
        </Button>
        {/* Generate password end */}

        {/* Web url */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
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
        {/* Web url end */}
      </View>
      {/* Info end */}

      {/** OTP */}
      <View style={commonStyles.SECTION_PADDING}>
        <Text text={translate('password.2fa_setup')} style={{ fontSize: fontSize.small }} />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("passwords_2fa_setup")}>
        <View
          style={[
            commonStyles.SECTION_PADDING,
            {
              backgroundColor: color.background,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            },
          ]}
        >
          {!totp ? <Text preset="black" text={translate('password.add_otp')} /> : <PasswordOtp data={totp} />}

          <FontAwesomeIcon name="angle-right" size={20} color={color.text} />
        </View>
      </TouchableOpacity>
      {/* Custom fields */}
      <CustomFieldsEdit fields={fields} setFields={setFields} />
      {/* Custom fields end */}

      {/* Others */}
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
      {/* Others end */}

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
          handleSave(pendingPayload.item, pendingPayload.strength)
        }}
        confirmText={translate("policy.password_violation_modal.use_anyway")}
      />
      {/* Violations modal end */}
    </Layout>
  )
})
