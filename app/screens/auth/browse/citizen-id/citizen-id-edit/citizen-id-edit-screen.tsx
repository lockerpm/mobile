import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  Text, Layout, Button, Header, FloatingInput, CipherOthersInfo, CustomFieldsEdit, Select
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
import { CitizenIdData, toCitizenIdData } from "../citizen-id.type"
import { GEN } from "../../../../../config/constants"
import countries from '../../../../../common/countries.json'

type CitizenIDEditScreenProp = RouteProp<PrimaryParamList, 'citizenIDs__edit'>;

type InputItem = {
  label: string,
  value: string,
  setter: (val: string) => void,
  onTouchStart?: () => void,
  isRequired?: boolean,
  isDateTime?: boolean,
  isSelect?: boolean,
  options?: { label: string, value: string | number | null }[],
  placeholder?: string,
  isDisableEdit?: boolean,
  type?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad'
}


export const CitizenIDEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<CitizenIDEditScreenProp>()
  const { mode } = route.params

  const { cipherStore, uiStore } = useStores()
  const { translate, color } = useMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const { newCipher } = useCipherHelpersMixins()
  const selectedCipher: CipherView = cipherStore.cipherView
  const citizenIdData = toCitizenIdData(selectedCipher.notes)
  // ------------------ PARAMS -----------------------

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')

  const [idNo, setID] = useState(mode !== 'add' ? citizenIdData.idNo : '')
  const [fullName, setFullName] = useState(mode !== 'add' ? citizenIdData.fullName : '')
  const [dob, setDob] = useState(mode !== 'add' ? citizenIdData.dob : '')
  const [sex, setSex] = useState(mode !== 'add' ? citizenIdData.sex : GEN.MALE)
  const [nationality, setNationality] = useState(mode !== 'add' ? citizenIdData.nationality : 'VN')
  const [placeOfOrigin, setPlaceOfOrigin] = useState(mode !== 'add' ? citizenIdData.placeOfOrigin : '')
  const [placeOfResidence, setPlaceOfResidence] = useState(mode !== 'add' ? citizenIdData.placeOfResidence : '')
  const [expiryDate, setExpiryDate] = useState(mode !== 'add' ? citizenIdData.expiryDate : '')
  const [personalId, setPersonalId] = useState(mode !== 'add' ? citizenIdData.personalId : '')
  const [dateOfIssue, setDateOfIssue] = useState(mode !== 'add' ? citizenIdData.dateOfIssue : '')
  const [issueBy, setIssueBy] = useState(mode !== 'add' ? citizenIdData.issueBy : '')
  const [note, setNote] = useState(mode !== 'add' ? citizenIdData.notes : '')

  const [folder, setFolder] = useState(mode !== 'add' ? selectedCipher.folderId : null)
  const [organizationId, setOrganizationId] = useState(mode === 'edit' ? selectedCipher.organizationId : null)
  const [collectionIds, setCollectionIds] = useState(mode !== 'add' ? selectedCipher.collectionIds : [])
  const [fields, setFields] = useState(mode !== 'add' ? selectedCipher.fields || [] : [])

  const [isLoading, setIsLoading] = useState(false)

  // ------------------ EFFECTS -----------------------

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (cipherStore.selectedFolder) {
        if (cipherStore.selectedFolder === 'unassigned') {
          setFolder(null)
        } else {
          setFolder(cipherStore.selectedFolder)
        }
        cipherStore.setSelectedFolder(null)
      }
      if (uiStore.selectedCountry) {
        const item = countries[uiStore.selectedCountry]
        if (item) {
          setNationality(uiStore.selectedCountry)
        }
        uiStore.setSelectedCountry(null)
      }
    });

    return unsubscribe
  }, [navigation])

  // ----------------- METHODS ----------------------

  const handleSave = async () => {
    setIsLoading(true)
    let payload: CipherView
    if (mode === 'add') {
      payload = newCipher(CipherType.CitizenID)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
    }

    const citizenIdData: CitizenIdData = {
      idNo,
      fullName,
      dob,
      sex,
      nationality,
      placeOfOrigin,
      placeOfResidence,
      expiryDate,
      personalId,
      dateOfIssue,
      issueBy,
      notes: note,
    }

    payload.fields = fields
    payload.name = name
    payload.notes = JSON.stringify(citizenIdData)
    payload.folderId = folder
    payload.organizationId = organizationId
    payload.secureNote = {
      // @ts-ignore
      response: null,
      type: 0
    }

    let res = { kind: 'unknown' }
    if (['add', 'clone'].includes(mode)) {
      res = await createCipher(payload, 0, collectionIds)
    } else {
      res = await updateCipher(payload.id, payload, 0, collectionIds)
    }

    setIsLoading(false)
    if (res.kind === 'ok') {
      navigation.goBack()
    }
  }

  const GENDER = [
    { label: translate('common.male'), value: GEN.MALE },
    { label: translate('common.female'), value: GEN.FEMALE },
    { label: translate('common.other'), value: GEN.OTHER },
  ]
  // ----------------- RENDER ----------------------

  const citizenIDDetails: InputItem[] = [
    {
      label: translate('citizen_id.id_no'),
      value: idNo,
      setter: setID,
      isRequired: true
    },
    {
      label: translate('common.fullname'),
      value: fullName,
      setter: setFullName
    },
    {
      label: translate('common.dob'),
      value: dob,
      setter: setDob,
      isDateTime: true,
      placeholder: 'dd/mm/yyyy'
    },
    {
      label: translate('citizen_id.sex'),
      value: sex,
      setter: setSex,
      isSelect: true,
      options: GENDER
    },
    {
      label: translate('common.nationality'),
      value: countries[nationality] ? countries[nationality].country_name : '',
      setter: setNationality,
      isDisableEdit: true,
      onTouchStart: () => {
        navigation.navigate('countrySelector', { initialId: nationality })
      }
    },
    {
      label: translate('citizen_id.place_of_origin'),
      value: placeOfOrigin,
      setter: setPlaceOfOrigin,
    },
    {
      label: translate('citizen_id.place_of_residence'),
      value: placeOfResidence,
      setter: setPlaceOfResidence
    },
    {
      label: translate('citizen_id.expiry_date'),
      value: expiryDate,
      setter: setExpiryDate,
      isDateTime: true,
      placeholder: 'dd/mm/yyyy'
    },
    {
      label: translate('citizen_id.personal_id'),
      value: personalId,
      setter: setPersonalId
    },
    {
      label: translate('citizen_id.date_of_issue'),
      value: dateOfIssue,
      setter: setDateOfIssue,
      isDateTime: true,
      placeholder: 'dd/mm/yyyy'
    },
    {
      label: translate('citizen_id.issued_by'),
      value: issueBy,
      setter: setIssueBy
    }
  ]


  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={
            mode === 'add'
              ? `${translate('common.add')} ${translate('common.citizen_id')}`
              : translate('common.edit')
          }
          goBack={() => navigation.goBack()}
          goBackText={translate('common.cancel')}
          right={(
            <Button
              preset="link"
              isDisabled={isLoading || !name.trim()}
              text={translate('common.save')}
              onPress={handleSave}
              style={{
                height: 35,
                alignItems: 'center',
                paddingLeft: 10
              }}
              textStyle={{
                fontSize: fontSize.p
              }}
            />
          )}
        />
      )}
    >
      {/* Name */}
      <View
        style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <BROWSE_ITEMS.citizenID.svgIcon height={40} width={40} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <FloatingInput
              isRequired
              label={translate('common.item_name')}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>
      {/* Name end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('common.citizen_id').toUpperCase()}
          style={{ fontSize: fontSize.small }}
        />
      </View>

      {/* Info */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
          paddingBottom: 32
        }]}
      >
        {
          citizenIDDetails.map((item, index) => (
            <View key={index} style={{ flex: 1, marginTop: index !== 0 ? 20 : 0 }}>
              {
                item.isSelect ? (
                  <Select
                    floating
                    placeholder={item.label}
                    value={item.value}
                    options={item.options}
                    onChange={val => item.setter(val)}
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
                )
              }
            </View>
          ))
        }
      </View>
      {/* Info end */}


      {/* Custom fields */}
      <CustomFieldsEdit
        fields={fields}
        setFields={setFields}
      />
      {/* Custom fields end */}

      {/* Others */}
      <CipherOthersInfo
        navigation={navigation}
        hasNote
        note={note}
        onChangeNote={setNote}
        folderId={folder}
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
