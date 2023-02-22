import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import find from "lodash/find"
import {
  Text,
  Layout,
  Button,
  Header,
  FloatingInput,
  CipherOthersInfo,
  Select,
  CustomFieldsEdit,
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { CipherType } from "../../../../../../core/enums"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { PassportData, toPassportData } from "../passport.type"
import { GEN } from "../../../../../config/constants"
import countries from "../../../../../common/countries.json"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { useFolderMixins } from "../../../../../services/mixins/folder"

type PassportEditScreenProp = RouteProp<PrimaryParamList, "passports__edit">

type InputItem = {
  label: string
  value: string
  setter: (val: string) => void
  onTouchStart?: () => void
  isSelect?: boolean
  options?: { label: string; value: string | number | null }[]
  isRequired?: boolean
  isDateTime?: boolean
  placeholder?: string
  isDisableEdit?: boolean
  type?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad" | "decimal-pad"
}

export const PassportEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<PassportEditScreenProp>()
  const { mode } = route.params

  const { cipherStore, collectionStore } = useStores()
  const { translate, color } = useMixins()
  const { shareFolderAddItem } = useFolderMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const selectedCipher: CipherView = cipherStore.cipherView
  const selectedCollection: CollectionView = route.params.collection
  const passportData = toPassportData(selectedCipher.notes)

  // ------------------ PARAMS -----------------------
  const isOwner = (() => {
    if (!selectedCipher.organizationId) {
      return true
    }
    const org = cipherStore.myShares.find(
      (s) => s.organization_id === selectedCipher.organizationId,
    )
    return !!org
  })()
  // Forms
  const [name, setName] = useState(mode !== "add" ? selectedCipher.name : "")

  const [passportID, setPassportID] = useState(mode !== "add" ? passportData.passportID : "")
  const [type, setType] = useState(mode !== "add" ? passportData.type : "")
  const [code, setCode] = useState(mode !== "add" ? passportData.code : "")
  const [fullName, setFullName] = useState(mode !== "add" ? passportData.fullName : "")
  const [dob, setDob] = useState(mode !== "add" ? passportData.dob : "")
  const [sex, setSex] = useState(mode !== "add" ? passportData.sex : GEN.MALE)
  const [nationality, setNationality] = useState(mode !== "add" ? passportData.nationality : "vn")
  const [idNumber, setIdNumber] = useState(mode !== "add" ? passportData.idNumber : "")
  const [dateOfIssue, setDateOfIssue] = useState(mode !== "add" ? passportData.dateOfIssue : "")
  const [dateOfExpiry, setDateOfExpiry] = useState(mode !== "add" ? passportData.dateOfExpiry : "")
  const [placeOfIssue, setPlaceOfIssue] = useState(mode !== "add" ? passportData.placeOfIssue : "")
  const [note, setNote] = useState(mode !== "add" ? passportData.notes : "")

  const [folder, setFolder] = useState(mode !== "add" ? selectedCipher.folderId : null)
  const [organizationId, setOrganizationId] = useState(
    mode === "edit" ? selectedCipher.organizationId : null,
  )
  const [collectionIds, setCollectionIds] = useState(
    mode !== "add" ? selectedCipher.collectionIds : [],
  )
  const [collection, setCollection] = useState(
    mode !== "add" && collectionIds.length > 0 ? collectionIds[0] : null,
  )
  const [fields, setFields] = useState(mode !== "add" ? selectedCipher.fields || [] : [])

  const [isLoading, setIsLoading] = useState(false)

  // ------------------ EFFECTS -----------------------

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
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

      if (cipherStore.selectedCollection) {
        if (!selectedCollection) setCollection(cipherStore.selectedCollection)
        setFolder(null)
        cipherStore.setSelectedCollection(null)
      }
    })

    return unsubscribe
  }, [navigation])

  // ----------------- METHODS ----------------------

  const handleSave = async () => {
    setIsLoading(true)
    let payload: CipherView
    if (mode === "add") {
      payload = newCipher(CipherType.Passport)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
    }

    const passportData: PassportData = {
      passportID,
      type,
      code,
      fullName,
      dob,
      sex,
      nationality,
      idNumber,
      dateOfIssue,
      dateOfExpiry,
      placeOfIssue,
      notes: note,
    }

    payload.fields = fields
    payload.name = name
    payload.notes = JSON.stringify(passportData)
    payload.folderId = folder
    payload.organizationId = organizationId
    payload.secureNote = {
      // @ts-ignore
      response: null,
      type: 0,
    }

    let res = { kind: "unknown" }
    if (["add", "clone"].includes(mode)) {
      res = await createCipher(payload, 0, collectionIds)
    } else {
      res = await updateCipher(payload.id, payload, 0, collectionIds)
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

      navigation.goBack()
    }
    setIsLoading(false)
  }
  const GENDER = [
    { label: translate("common.male"), value: GEN.MALE },
    { label: translate("common.female"), value: GEN.FEMALE },
    { label: translate("common.other"), value: GEN.OTHER },
  ]
  // ----------------- RENDER ----------------------

  const passportDetails: InputItem[] = [
    {
      label: translate("passport.passport_id"),
      value: passportID,
      setter: setPassportID,
      isRequired: true,
    },
    {
      label: translate("passport.type"),
      value: type,
      setter: setType,
    },
    {
      label: translate("passport.code"),
      value: code,
      setter: setCode,
    },
    {
      label: translate("common.fullname"),
      value: fullName,
      setter: setFullName,
    },
    {
      label: translate("common.dob"),
      value: dob,
      setter: setDob,
      isDateTime: true,
      placeholder: "dd/mm/yyyy",
    },
    {
      label: translate("passport.sex"),
      value: sex,
      setter: setSex,
      isSelect: true,
      options: GENDER,
    },
    {
      label: translate("common.nationality"),
      value: countries[nationality?.toUpperCase()]
        ? countries[nationality?.toUpperCase()].country_name
        : "",
      setter: setNationality,
      isDisableEdit: true,
      onTouchStart: () => {
        navigation.navigate("countrySelector", { initialId: nationality })
      },
    },
    {
      label: translate("passport.id_number"),
      value: idNumber,
      setter: setIdNumber,
    },
    {
      label: translate("passport.date_of_issue"),
      value: dateOfIssue,
      setter: setDateOfIssue,
      isDateTime: true,
      placeholder: "dd/mm/yyyy",
    },
    {
      label: translate("passport.date_of_expiry"),
      value: dateOfExpiry,
      setter: setDateOfExpiry,
      isDateTime: true,
      placeholder: "dd/mm/yyyy",
    },
    {
      label: translate("passport.place_of_issue"),
      value: placeOfIssue,
      setter: setPlaceOfIssue,
    },
  ]

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
      }}
      header={
        <Header
          title={
            mode === "add"
              ? `${translate("common.add")} ${translate("common.passport")}`
              : translate("common.edit")
          }
          goBack={() => navigation.goBack()}
          goBackText={translate("common.cancel")}
          right={
            <Button
              preset="link"
              isDisabled={isLoading || !name.trim()}
              text={translate("common.save")}
              onPress={handleSave}
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
      {/* Name */}
      <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}>
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <BROWSE_ITEMS.passport.svgIcon height={40} width={40} />
          <View style={{ flex: 1, marginLeft: 10 }}>
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
          text={translate("common.passport").toUpperCase()}
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
        {passportDetails.map((item, index) => (
          <View key={index} style={{ flex: 1, marginTop: index !== 0 ? 20 : 0 }}>
            {item.isSelect ? (
              <Select
                floating
                placeholder={item.label}
                value={item.value}
                options={item.options}
                onChange={(val) => item.setter(val)}
              />
            ) : (
              <FloatingInput
                editable={item.isDisableEdit}
                isDateTime={item.isDateTime}
                isRequired={item.isRequired}
                label={item.label}
                value={item.value}
                onChangeText={(text) => {
                  item.setter(text)
                }}
                onTouchStart={item.onTouchStart}
                placeholder={item.placeholder}
              />
            )}
          </View>
        ))}
      </View>
      {/* Info end */}

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
    </Layout>
  )
})
