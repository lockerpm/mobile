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
import { SocialSecurityNumberData, toSocialSecurityNumberData } from "../social-security-number.type"


type EditScreenProp = RouteProp<PrimaryParamList, 'socialSecurityNumbers__edit'>;

type InputItem = {
  label: string,
  value: string,
  setter: (val: string) => void,
  isRequired?: boolean,
  type?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad'
}


export const SocialSecurityNumberEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<EditScreenProp>()
  const { mode } = route.params

  const { cipherStore } = useStores()
  const { translate, color } = useMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const selectedCipher: CipherView = cipherStore.cipherView
  const socialSecurityNumberData = toSocialSecurityNumberData(selectedCipher.notes)

  // ------------------ PARAMS -----------------------

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  
  const [fullName, setFullName] = useState(mode !== 'add' ? socialSecurityNumberData.fullName : '')
  const [socialSecurityNumber, setSocialSecurityNumber] = useState(mode !== 'add' ? socialSecurityNumberData.socialSecurityNumber : '')
  const [dateOfIssue, setDateOfIssue] = useState(mode !== 'add' ? socialSecurityNumberData.dateOfIssue : '')
  const [contry, setContry] = useState(mode !== 'add' ? socialSecurityNumberData.contry : '')
  const [note, setNote] = useState(mode !== 'add' ? socialSecurityNumberData.notes : '')
 
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
      payload = newCipher(CipherType.SocialSecurityNumber)
    } else {
      // @ts-ignore
      payload = {...selectedCipher}
    }

    const socialSecurityNumberData: SocialSecurityNumberData = {
      fullName,
      socialSecurityNumber,
      dateOfIssue,
      contry,
      notes: note,
    }

    payload.fields = fields
    payload.name = name
    payload.notes = JSON.stringify(socialSecurityNumberData)
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

  const socialSecurityNumberDetails: InputItem[] = [
    {
      label: translate('common.fullname'),
      value: fullName,
      setter: setFullName
    },
    {
      label: translate('common.social_security_number'),
      value: socialSecurityNumber,
      setter: setSocialSecurityNumber
    },
    {
      label: translate('passport.date_of_issue'),
      value: dateOfIssue,
      setter: setDateOfIssue
    },
    {
      label: translate('common.nationality'),
      value: contry,
      setter: setContry,
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
              ? `${translate('common.add')} ${translate('common.social_security_number')}`
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
          <BROWSE_ITEMS.social_security_number.svgIcon height={40} width={40} />
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
          text={translate('common.social_security_number').toUpperCase()}
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
          socialSecurityNumberDetails.map((e, index) => (
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
