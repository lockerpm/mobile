import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Button, AutoImage as Image, Text, FloatingInput, CipherInfoCommon } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color, commonStyles } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { CardAction } from "../card-action"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { DeletedAction } from "../../../../../components/cipher/cipher-action/deleted-action"
import { CARD_BRANDS } from "../constants"
import { useMixins } from "../../../../../services/mixins"


export const CardInfoScreen = observer(function CardInfoScreen() {
  const navigation = useNavigation()
  const { cipherStore } = useStores()
  const { translate } = useMixins()
  const selectedCipher: CipherView = cipherStore.cipherView

  const [showAction, setShowAction] = useState(false)

  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
        paddingTop: 0
      }}
      header={(
        <Header
          goBack={() => navigation.goBack()}
          right={(
            <Button
              preset="link"
              onPress={() => setShowAction(true)}
            >
              <IoniconsIcon
                name="ellipsis-horizontal"
                size={18}
                color={color.title}
              />
            </Button>
          )}
        />
      )}
    >
      {/* Actions */}
      {
        selectedCipher.deletedDate ? (
          <DeletedAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
          />
        ) : (
          <CardAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
          />
        )
      }
      {/* Actions end */}

      {/* Intro */}
      <View>
        <View style={[commonStyles.CENTER_VIEW, {
          backgroundColor: color.palette.white,
          paddingTop: 20,
          paddingBottom: 30,
          marginBottom: 10
        }]}>
          <Image
            source={BROWSE_ITEMS.card.icon}
            style={{ height: 55, width: 55, marginBottom: 5 }}
          />
          <Text
            preset="header"
            text={selectedCipher.name}
          />
        </View>
      </View>
      {/* Intro end */}

      {/* Info */}
      <View style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingVertical: 22
      }]}>
        {/* Cardholder name */}
        <FloatingInput
          fixedLabel
          copyAble
          label={translate('card.card_name')}
          value={selectedCipher.card.cardholderName}
          editable={false}
          style={{ marginBottom: 10 }}
        />
        {/* Cardholder name end */}

        {/* Brand */}
        <FloatingInput
          fixedLabel
          copyAble
          label={translate('card.brand')}
          value={(CARD_BRANDS.find(i => i.value === selectedCipher.card.brand) || { label: '' }).label}
          editable={false}
          style={{ marginVertical: 10 }}
        />
        {/* Brand end */}

        {/* Number */}
        <FloatingInput
          fixedLabel
          copyAble
          label={translate('card.card_number')}
          value={selectedCipher.card.number}
          editable={false}
          style={{ marginVertical: 10 }}
        />
        {/* Number end */}

        {/* Exp date */}
        <FloatingInput
          fixedLabel
          copyAble
          label={translate('card.exp_date')}
          value={`${selectedCipher.card.expMonth}/${selectedCipher.card.expYear}`}
          editable={false}
          style={{ marginVertical: 10 }}
        />
        {/* Exp date end */}

        {/* CVV */}
        <FloatingInput
          fixedLabel
          copyAble
          isPassword
          label={translate('card.cvv')}
          value={selectedCipher.card.code}
          editable={false}
          style={{ marginVertical: 10 }}
        />
        {/* CVV end */}

        {/* Notes */}
        <FloatingInput
          label={translate('common.notes')}
          value={selectedCipher.notes}
          editable={false}
          textarea
          fixedLabel
          copyAble
          style={{ marginTop: 10 }}
        />
        {/* Notes end */}

        {/* Others common info */}
        <CipherInfoCommon cipher={selectedCipher} />
        {/* Others common info end */}
      </View>
      {/* Info end */}
    </Layout>
  )
})
