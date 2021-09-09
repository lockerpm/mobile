import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  AutoImage as Image, Text, Layout, Button, Header, FloatingInput, CipherOthersInfo
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { color, commonStyles, fontSize } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView, IdentityView } from "../../../../../../core/models/view"
import { CipherType } from "../../../../../../core/enums"
import { translate } from "../../../../../i18n"


type IdentityEditScreenProp = RouteProp<PrimaryParamList, 'identities__edit'>;
type InputItem = {
  label: string,
  value: string,
  setter: Function,
  isRequired?: boolean,
  type?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad'
}


export const IdentityEditScreen = observer(function IdentityEditScreen() {
  const navigation = useNavigation()
  const route = useRoute<IdentityEditScreenProp>()
  const { mode } = route.params
  const { newCipher, createCipher, updateCipher } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  // Params

  const [isLoading, setIsLoading] = useState(false)

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [title, setTitle] = useState(mode !== 'add' ? selectedCipher.identity.title : '')
  const [firstName, setFirstName] = useState(mode !== 'add' ? selectedCipher.identity.firstName : '')
  const [lastName, setLastName] = useState(mode !== 'add' ? selectedCipher.identity.lastName : '')
  const [username, setUsername] = useState(mode !== 'add' ? selectedCipher.identity.username : '')
  const [email, setEmail] = useState(mode !== 'add' ? selectedCipher.identity.email : '')
  const [phone, setPhone] = useState(mode !== 'add' ? selectedCipher.identity.phone : '')
  const [company, setCompany] = useState(mode !== 'add' ? selectedCipher.identity.company : '')
  const [ssn, setSsn] = useState(mode !== 'add' ? selectedCipher.identity.ssn : '')
  const [passport, setPassport] = useState(mode !== 'add' ? selectedCipher.identity.passportNumber : '')
  const [license, setLicense] = useState(mode !== 'add' ? selectedCipher.identity.licenseNumber : '')
  const [address1, setAddress1] = useState(mode !== 'add' ? selectedCipher.identity.address1 : '')
  const [address2, setAddress2] = useState(mode !== 'add' ? selectedCipher.identity.address2 : '')
  // const [address3, setAddress3] = useState(mode !== 'add' ? selectedCipher.identity.address3 : '')
  const [city, setCity] = useState(mode !== 'add' ? selectedCipher.identity.city : '')
  const [state, setState] = useState(mode !== 'add' ? selectedCipher.identity.state : '')
  const [zip, setZip] = useState(mode !== 'add' ? selectedCipher.identity.postalCode : '')
  const [country, setCountry] = useState(mode !== 'add' ? selectedCipher.identity.country : '')
  const [note, setNote] = useState(mode !== 'add' ? selectedCipher.notes : '')
  const [folder, setFolder] = useState(mode !== 'add' ? selectedCipher.folderId : null)

  // Watchers

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (cipherStore.selectedFolder) {
        setFolder(cipherStore.selectedFolder)
        cipherStore.setSelectedFolder(null)
      }
    });

    return unsubscribe
  }, [navigation])

  // Methods

  const handleSave = async () => {
    setIsLoading(true)
    let payload: CipherView
    if (mode === 'add') {
      payload = newCipher(CipherType.Identity)
    } else {
      payload = {...selectedCipher}
    }

    const data = new IdentityView()
    data.title = title
    data.firstName = firstName
    data.lastName = lastName
    data.username = username
    data.email = email
    data.company = company
    data.phone = phone
    data.ssn = ssn
    data.passportNumber = passport
    data.licenseNumber = license
    data.address1 = address1
    data.address2 = address2
    // data.address3 = address3
    data.city = city
    data.state = state
    data.postalCode = zip
    data.country = country

    payload.name = name
    payload.notes = note
    payload.folderId = folder
    payload.identity = data
    const collectionIds = payload.collectionIds

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

  // Render

  const contactDetails: InputItem[] = [
    {
      label: translate('identity.title'),
      value: title,
      setter: setTitle
    },
    {
      label: translate('identity.first_name'),
      value: firstName,
      setter: setFirstName
    },
    {
      label: translate('identity.last_name'),
      value: lastName,
      setter: setLastName
    },
    {
      label: translate('identity.username'),
      value: username,
      setter: setUsername
    },
    {
      label: translate('identity.email'),
      value: email,
      setter: setEmail,
      type: 'email-address'
    },
    {
      label: translate('identity.company'),
      value: company,
      setter: setCompany
    },
    {
      label: translate('identity.phone'),
      value: phone,
      setter: setPhone,
      type: 'numeric'
    },
    {
      label: translate('identity.ssn'),
      value: ssn,
      setter: setSsn,
      type: 'numeric'
    },
    {
      label: translate('identity.passport'),
      value: passport,
      setter: setPassport,
      type: 'numeric'
    },
    {
      label: translate('identity.license'),
      value: license,
      setter: setLicense,
      type: 'numeric'
    }
  ]

  const addressDetails: InputItem[] = [
    {
      label: translate('identity.address') + ' 1',
      value: address1,
      setter: setAddress1
    },
    {
      label: translate('identity.address') + ' 2',
      value: address2,
      setter: setAddress2
    },
    // {
    //   label: translate('identity.address') + ' 3',
    //   value: address3,
    //   setter: setAddress3
    // },
    {
      label: translate('identity.city'),
      value: city,
      setter: setCity
    },
    {
      label: translate('identity.state'),
      value: state,
      setter: setState
    },
    {
      label: translate('identity.zip'),
      value: zip,
      setter: setZip,
      type: 'numeric'
    },
    {
      label: translate('identity.country'),
      value: country,
      setter: setCountry
    },
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
              ? `${translate('common.add')} ${translate('common.identity')}`
              : translate('common.edit')
          }
          goBack={() => navigation.goBack()}
          goBackText={translate('common.cancel')}
          right={(
            <Button
              preset="link"
              text={translate('common.save')}
              onPress={handleSave}
              textStyle={{
                fontSize: fontSize.small
              }}
            />
          )}
        />
      )}
    >
      {/* Name */}
      <View
        style={[commonStyles.SECTION_PADDING, { backgroundColor: color.palette.white }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Image
            source={BROWSE_ITEMS.identity.icon}
            style={{ height: 40, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <FloatingInput
              isRequired
              label="Name"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>
      {/* Name end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('identity.personal_info').toUpperCase()}
          style={{ fontSize: fontSize.small }}
        />
      </View>

      {/* Info */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingBottom: 32
        }]}
      >
        {
          contactDetails.map((item, index) => (
            <FloatingInput
              key={index}
              isRequired={item.isRequired}
              keyboardType={item.type || 'default'}
              label={item.label}
              value={item.value}
              onChangeText={(text) => item.setter(text)}
              style={{
                marginTop: index !== 0 ? 20 : 0
              }}
            />
          ))
        }
      </View>
      {/* Info end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('identity.address_details').toUpperCase()}
          style={{ fontSize: fontSize.small }}
        />
      </View>

      {/* Address */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingBottom: 32
        }]}
      >
        {
          addressDetails.map((item, index) => (
            <FloatingInput
              key={index}
              isRequired={item.isRequired}
              keyboardType={item.type || 'default'}
              label={item.label}
              value={item.value}
              onChangeText={(text) => item.setter(text)}
              style={{
                marginTop: index !== 0 ? 20 : 0
              }}
            />
          ))
        }
      </View>
      {/* Address end */}

      {/* Others */}
      <CipherOthersInfo
        navigation={navigation}
        hasNote
        note={note}
        onChangeNote={setNote}
      />
      {/* Others end */}
    </Layout>
  )
})
