import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  AutoImage as Image, Text, Layout, Button, Header, FloatingInput, CipherOthersInfo, Select
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { TextInputMaskOptionProp, TextInputMaskTypeProp } from "react-native-masked-text"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { CardView, CipherView } from "../../../../../../core/models/view"
import { CipherType } from "../../../../../../core/enums"
import { CARD_BRANDS } from "../constants"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"


type CardEditScreenProp = RouteProp<PrimaryParamList, 'cards__edit'>;
type InputItem = {
  label: string,
  value: string,
  setter: Function,
  isRequired?: boolean,
  inputType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad',
  placeholder?: string,
  isPassword?: boolean,
  maskType?: TextInputMaskTypeProp,
  maskOptions?: TextInputMaskOptionProp,
  isSelect?: boolean,
  options?: { label: string, value: string | number | null }[]
}


export const CardEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<CardEditScreenProp>()
  const { mode } = route.params
  const { translate, color } = useMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { cipherStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView

  // Params

  const [isLoading, setIsLoading] = useState(false)

  // Forms

  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [cardName, setCardName] = useState(mode !== 'add' ? selectedCipher.card.cardholderName : '')
  const [brand, setBrand] = useState(mode !== 'add' ? selectedCipher.card.brand : '')
  const [cardNumber, setCardNumber] = useState(mode !== 'add' ? selectedCipher.card.number : '')
  const [expDate, setExpDate] = useState(mode !== 'add' ? `${selectedCipher.card.expMonth}/${selectedCipher.card.expYear}` : '')
  const [securityCode, setSecurityCode] = useState(mode !== 'add' ? selectedCipher.card.code : '')
  const [note, setNote] = useState(mode !== 'add' ? selectedCipher.notes : '')
  const [folder, setFolder] = useState(mode !== 'add' ? selectedCipher.folderId : null)
  const [organizationId, setOrganizationId] = useState(mode === 'edit' ? selectedCipher.organizationId : null)
  const [collectionIds, setCollectionIds] = useState(mode !== 'add' ? selectedCipher.collectionIds : [])

  // Watchers

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

  // Methods

  const handleSave = async () => {
    setIsLoading(true)
    let payload: CipherView
    if (mode === 'add') {
      payload = newCipher(CipherType.Card)
    } else {
      // @ts-ignore
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
    payload.organizationId = organizationId

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
      setter: setBrand,
      isSelect: true,
      options: CARD_BRANDS
    },
    {
      label: translate('card.card_number'),
      value: cardNumber,
      setter: setCardNumber,
      inputType: 'numeric',
      maskType: 'credit-card',
      placeholder: '0000 0000 0000 0000'
    },
    {
      label: translate('card.exp_date'),
      value: expDate,
      setter: setExpDate,
      inputType: 'numeric',
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
      inputType: 'numeric',
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
      {/* Title */}
      <View
        style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Image
            source={BROWSE_ITEMS.card.icon}
            style={{ height: 40, width: 40 }}
          />
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
      {/* Title end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('card.card_details').toUpperCase()}
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
          cardDetails.map((item, index) => (
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
                    isRequired={item.isRequired}
                    isPassword={item.isPassword}
                    keyboardType={item.inputType || 'default'}
                    maskType={item.maskType}
                    maskOptions={item.maskOptions}
                    label={item.label}
                    value={item.value}
                    onChangeText={(text) => {
                      item.setter(text)
                    }}
                    placeholder={item.placeholder}
                  />
                )
              }
              
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
