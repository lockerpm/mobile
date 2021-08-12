import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { 
  AutoImage as Image, Text, Layout, Button, Header, FloatingInput, CipherOthersInfo
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, commonStyles } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'


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

  // Forms
  const [title, setTitle] = useState('')
  const [fullName, setfullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [country, setCountry] = useState()
  const [note, setNote] = useState('')

  const contactDetails: InputItem[] = [
    {
      label: 'Full Name',
      value: fullName,
      setter: setfullName,
      isRequired: true
    },
    {
      label: 'Email',
      value: email,
      setter: setEmail,
      type: 'email-address'
    },
    {
      label: 'Phone',
      value: phone,
      setter: setPhone,
      type: 'numeric'
    }
  ]

  const addressDetails: InputItem[] = [
    {
      label: 'Address 1',
      value: address1,
      setter: setAddress1
    },
    {
      label: 'Address 2',
      value: address2,
      setter: setAddress2
    },
    {
      label: 'City',
      value: city,
      setter: setCity
    },
    {
      label: 'State or Region',
      value: state,
      setter: setState
    },
    {
      label: 'ZIP or Postal Code',
      value: zip,
      setter: setZip,
      type: 'numeric'
    }
  ]

  return (
    <Layout
      containerStyle={{ 
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={mode === 'add' ? 'Add Personal Info' : 'Edit'}
          goBack={() => navigation.goBack()}
          goBackText="Cancel"
          right={(
            <Button
              preset="link"
              text="Save"
              textStyle={{
                fontSize: 12
              }}
            />
          )}
        />
      )}
    >
      {/* Title */}
      <View
        style={[commonStyles.SECTION_PADDING, { backgroundColor: color.palette.white }]}
      >
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW]}
        >
          <Image
            source={BROWSE_ITEMS.indentity.icon}
            style={{ height: 40, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <FloatingInput
              isRequired
              label="Title"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>
      </View>
      {/* Title end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text text="CONTACT DETAILS" style={{ fontSize: 10 }} />
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
        <Text text="ADDRESS DETAILS" style={{ fontSize: 10 }} />
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

        <Button
          preset="link"
          onPress={() => navigation.navigate('countrySelector')}
          style={{ marginTop: 20 }}
        >
          <View
            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              justifyContent: 'space-between',
              width: '100%'
            }]}
          >
            <View>
              <Text 
                text="Country"
                style={{ fontSize: 10 }}
              />
              <Text
                preset="black"
                text="Vietnam"
              />
            </View>
            <FontAwesomeIcon
              name="angle-right"
              size={20}
              color={color.text}
            />
          </View>
        </Button>
      </View>
      {/* Address end */}

      {/* Others */}
      <CipherOthersInfo
        navigation={navigation}
        mode={mode === 'add' ? 'add' : 'move'}
        hasNote
        note={note}
        onChangeNote={setNote}
      />
      {/* Others end */}
    </Layout>
  )
})
