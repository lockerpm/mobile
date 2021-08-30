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


export const CardInfoScreen = observer(function CardInfoScreen() {
  const navigation = useNavigation()
  const { cipherStore } = useStores()
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
                size={16}
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
            onClose={setShowAction}
          />
        ) : (
          <CardAction
            navigation={navigation}
            isOpen={showAction}
            onClose={setShowAction}
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
          label="Cardholder name"
          value={selectedCipher.card.cardholderName}
          editable={false}
          style={{ marginBottom: 10 }}
        />
        {/* Cardholder name end */}

        {/* Brand */}
        <FloatingInput
          fixedLabel
          copyAble
          label="Brand"
          value={selectedCipher.card.brand}
          editable={false}
          style={{ marginVertical: 10 }}
        />
        {/* Brand end */}

        {/* Number */}
        <FloatingInput
          fixedLabel
          copyAble
          label="Card number"
          value={selectedCipher.card.number}
          editable={false}
          style={{ marginVertical: 10 }}
        />
        {/* Number end */}

        {/* Exp month */}
        <FloatingInput
          fixedLabel
          copyAble
          label="Expiration month"
          value={selectedCipher.card.expMonth}
          editable={false}
          style={{ marginVertical: 10 }}
        />
        {/* Exp month end */}

        {/* Exp year */}
        <FloatingInput
          fixedLabel
          copyAble
          label="Expiration year"
          value={selectedCipher.card.expYear}
          editable={false}
          style={{ marginVertical: 10 }}
        />
        {/* Exp year end */}

        {/* CVV */}
        <FloatingInput
          fixedLabel
          copyAble
          isPassword
          label="Security code (CVV)"
          value={selectedCipher.card.code}
          editable={false}
          style={{ marginVertical: 10 }}
        />
        {/* CVV end */}

        {/* Notes */}
        <FloatingInput
          label="Notes"
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
