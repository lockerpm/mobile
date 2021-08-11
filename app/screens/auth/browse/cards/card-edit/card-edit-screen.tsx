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


type CardEditScreenProp = RouteProp<PrimaryParamList, 'cards__edit'>;
type InputItem = {
  label: string,
  value: string,
  setter: Function,
  isRequired?: boolean,
  type?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad',
  mask?: string,
  placeholder?: string,
  isPassword?: boolean
}


export const CardEditScreen = observer(function CardEditScreen() {
  const navigation = useNavigation()
  const route = useRoute<CardEditScreenProp>()
  const { mode } = route.params


  // Forms
  const [title, setTitle] = useState('')
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [expDate, setExpDate] = useState('')
  const [securityCode, setSecurityCode] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [note, setNote] = useState('')

  const cardDetails: InputItem[] = [
    {
      label: 'Cardholder Name',
      value: name,
      setter: setName
    },
    {
      label: 'Card Number',
      value: number,
      setter: setNumber,
      isRequired: true,
      type: 'numeric',
      mask: '9999 9999 9999 9999',
      placeholder: '0000 0000 0000 0000'

    },
    {
      label: 'Expiration Date',
      value: expDate,
      setter: setExpDate,
      type: 'numeric',
      mask: '99 / 99',
      placeholder: 'MM / YY'
    },
    {
      label: 'Security Code (CVV/CVC)',
      value: securityCode,
      setter: setSecurityCode,
      mask: '999',
      type: 'numeric',
      placeholder: '000',
      isPassword: true
    },
    {
      label: 'ZIP or Postal Code',
      value: zipCode,
      setter: setZipCode,
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
          title={mode === 'add' ? 'Add Card' : 'Edit'}
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
            source={BROWSE_ITEMS.card.icon}
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
        <Text text="CARD DETAILS" style={{ fontSize: 10 }} />
      </View>

      {/* Info */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingBottom: 32
        }]}
      >
        {
          cardDetails.map((item, index) => (
            <View key={index} style={{ flex: 1, marginTop: index !== 0 ? 20 : 0 }}>
              <FloatingInput
                isRequired={item.isRequired}
                isPassword={item.isPassword}
                keyboardType={item.type || 'default'}
                mask={item.mask}
                label={item.label}
                value={item.value}
                onChangeText={(text) => item.setter(text)}
                placeholder={item.placeholder}
              />
            </View>
          ))
        }
      </View>
      {/* Info end */}

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
