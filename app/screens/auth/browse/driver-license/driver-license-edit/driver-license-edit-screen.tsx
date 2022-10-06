import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  Text, Layout, Button, Header, FloatingInput, CipherOthersInfo, Select, CustomFieldsEdit
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView, IdentityView } from "../../../../../../core/models/view"
import { CipherType } from "../../../../../../core/enums"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { DriverLicenseData, toDriverLicenseData } from "../driver-license.type"


type DriverLicenseEditScreenProp = RouteProp<PrimaryParamList, 'driverLicenses__edit'>;

type InputItem = {
  label: string,
  value: string,
  setter: (val: string) => void,
  isRequired?: boolean,
  type?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad'
}


export const DriverLicenseEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<DriverLicenseEditScreenProp>()
  const { mode } = route.params

  const { cipherStore } = useStores()
  const { translate, color } = useMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const selectedCipher: CipherView = cipherStore.cipherView
  const driverLicenseData = toDriverLicenseData(selectedCipher.notes)

  // ------------------ PARAMS -----------------------

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')

  const [idNO, setIdNo] = useState(mode !== 'add' ? driverLicenseData.idNO : '')
  const [fullName, setFullName] = useState(mode !== 'add' ? driverLicenseData.fullName : '')
  const [dob, setDob] = useState(mode !== 'add' ? driverLicenseData.dob : '')
  const [address, setAddress] = useState(mode !== 'add' ? driverLicenseData.address : '')
  const [nationality, setNationality] = useState(mode !== 'add' ? driverLicenseData.nationality : '')
  const [classId, setClass] = useState(mode !== 'add' ? driverLicenseData.class : '')
  const [validUntil, setValidUntil] = useState(mode !== 'add' ? driverLicenseData.validUntil : '')
  const [vehicleClass, setVehicleClass] = useState(mode !== 'add' ? driverLicenseData.vehicleClass : '')
  const [beginningDate, setBeginningDate] = useState(mode !== 'add' ? driverLicenseData.beginningDate : '')
  const [issuedBy, setIssuedBy] = useState(mode !== 'add' ? driverLicenseData.issuedBy : '')
  const [note, setNote] = useState(mode !== 'add' ? driverLicenseData.notes : '')

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
    });

    return unsubscribe
  }, [navigation])

  // ----------------- METHODS ----------------------

  const handleSave = async () => {
    setIsLoading(true)
    let payload: CipherView
    if (mode === 'add') {
      payload = newCipher(CipherType.DriverLicense)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
    }

    const driverLicenseData: DriverLicenseData = {
      idNO,
      fullName,
      dob,
      address,
      nationality,
      class: classId,
      validUntil,
      vehicleClass,
      beginningDate,
      issuedBy,
      notes: note,
    }

    payload.fields = fields
    payload.name = name
    payload.notes = JSON.stringify(driverLicenseData)
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

  // ----------------- RENDER ----------------------

  const driverLicenseDetails: InputItem[] = [
    {
      label: translate('driver_license.no'),
      value: idNO,
      setter: setIdNo
    },
    {
      label: translate('common.fullname'),
      value: fullName,
      setter: setFullName
    },
    {
      label: translate('common.dob'),
      value: dob,
      setter: setDob
    },
    {
      label: translate('common.address'),
      value: address,
      setter: setAddress,
    },
    {
      label: translate('common.nationality'),
      value: nationality,
      setter: setNationality
    },
    {
      label: translate('driver_license.class'),
      value: classId,
      setter: setClass
    },
    {
      label: translate('driver_license.valid_until'),
      value: validUntil,
      setter: setValidUntil
    },
    {
      label: translate('driver_license.vehicle_class'),
      value: vehicleClass,
      setter: setVehicleClass
    },
    {
      label: translate('driver_license.beginning_date'),
      value: beginningDate,
      setter: setBeginningDate
    },
    {
      label: translate('driver_license.issued_by'),
      value: issuedBy,
      setter: setIssuedBy
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
              ? `${translate('common.add')} ${translate('common.driver_license')}`
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
          <BROWSE_ITEMS.driver_license.svgIcon height={40} width={40} />
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
          text={translate('common.driver_license').toUpperCase()}
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
          driverLicenseDetails.map((e,index) => (
          <View 
            key={index}
            style={{ flex: 1, marginTop: index === 0 ? 0 : 20 }}>
              <FloatingInput
                label={e.label}
                value={e.value}
                onChangeText={e.setter}
              />
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
