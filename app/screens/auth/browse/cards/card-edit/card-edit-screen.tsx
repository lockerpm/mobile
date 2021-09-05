import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  AutoImage as Image, Text, Layout, Button, Header, FloatingInput, CipherOthersInfo
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { color, commonStyles } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { TextInputMaskOptionProp, TextInputMaskTypeProp } from "react-native-masked-text"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { CardView, CipherView } from "../../../../../../core/models/view"
import { CipherType } from "../../../../../../core/enums"
import { translate } from "../../../../../i18n"


type CardEditScreenProp = RouteProp<PrimaryParamList, 'cards__edit'>;
type InputItem = {
  label: string,
  value: string,
  setter: Function,
  isRequired?: boolean,
  type?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad',
  placeholder?: string,
  isPassword?: boolean,
  maskType?: TextInputMaskTypeProp,
  maskOptions?: TextInputMaskOptionProp
}


export const CardEditScreen = observer(function CardEditScreen() {
  const navigation = useNavigation()
  const route = useRoute<CardEditScreenProp>()
  const { mode } = route.params
  const { newCipher, createCipher, updateCipher } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  // Params

  const [isLoading, setIsLoading] = useState(false)

  // Forms

  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [cardName, setCardName] = useState(mode !== 'add' ? selectedCipher.card.cardholderName : '')
  const [brand, setBrand] = useState(mode !== 'add' ? selectedCipher.card.brand : '')
  const [cardNumber, setCardNumber] = useState(mode !== 'add' ? selectedCipher.card.number : '')
  const [expDate, setExpDate] = useState(mode !== 'add' ? `${selectedCipher.card.expMonth}/${selectedCipher.card.expYear}` : '')
  const [securityCode, setSecurityCode] = useState(mode !== 'add' ? selectedCipher.card.code : '')
  const [note, setNote] = useState(mode !== 'add' ? selectedCipher.name : '')
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
      payload = newCipher(CipherType.Card)
    } else {
      payload = {...selectedCipher}
    }

    const data = new CardView()
    data.cardholderName = cardName
    data.brand = brand
    data.number = cardNumber
    if (expDate) {
      const splitDate = expDate.split('/')
      data.expMonth = splitDate[0]
      data.expYear = splitDate[1]
    }
    data.code = securityCode

    payload.name = name
    payload.notes = note
    payload.folderId = folder
    payload.card = data
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

  const cardDetails: InputItem[] = [
    {
      label: translate('card.card_name'),
      value: cardName,
      setter: setCardName,
      isRequired: true
    },
    {
      label: translate('card.brand'),
      value: brand,
      setter: setBrand
    },
    {
      label: translate('card.card_number'),
      value: cardNumber,
      setter: setCardNumber,
      type: 'numeric',
      maskType: 'credit-card',
      placeholder: '0000 0000 0000 0000'
    },
    {
      label: translate('card.exp_date'),
      value: expDate,
      setter: setExpDate,
      type: 'numeric',
      maskType: 'datetime',
      maskOptions: {
        format: 'MM/YY'
      },
      placeholder: 'MM/YY'
    },
    {
      label: translate('card.cvv'),
      value: securityCode,
      setter: setSecurityCode,
      maskOptions: {
        mask: '999'
      },
      type: 'numeric',
      placeholder: '000',
      isPassword: true
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
              ? `${translate('common.add')} ${translate('common.card')}`
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
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Image
            source={BROWSE_ITEMS.card.icon}
            style={{ height: 40, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <FloatingInput
              isRequired
              label={translate('common.name')}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>
      {/* Title end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('card.card_details').toUpperCase()}
          style={{ fontSize: 10 }}
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
          cardDetails.map((item, index) => (
            <View key={index} style={{ flex: 1, marginTop: index !== 0 ? 20 : 0 }}>
              <FloatingInput
                isRequired={item.isRequired}
                isPassword={item.isPassword}
                keyboardType={item.type || 'default'}
                maskType={item.maskType}
                maskOptions={item.maskOptions}
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
        hasNote
        note={note}
        onChangeNote={setNote}
        folderId={folder}
      />
      {/* Others end */}
    </Layout>
  )
})
