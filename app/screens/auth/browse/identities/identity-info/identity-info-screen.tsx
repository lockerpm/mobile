import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Button, AutoImage as Image, Text, FloatingInput, CipherInfoCommon } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color, commonStyles } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { IdentityAction } from "../identity-action"
import { CipherView } from "../../../../../../core/models/view"
import { useStores } from "../../../../../models"


export const IdentityInfoScreen = observer(function IdentityInfoScreen() {
  const navigation = useNavigation()
  const { cipherStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView

  const [showAction, setShowAction] = useState(false)

  const textFields = [
    {
      label: 'Title',
      value: selectedCipher.identity.title
    },
    {
      label: 'First name',
      value: selectedCipher.identity.firstName
    },
    {
      label: 'Last name',
      value: selectedCipher.identity.lastName
    },
    {
      label: 'Username',
      value: selectedCipher.identity.username
    },
    {
      label: 'Email',
      value: selectedCipher.identity.email
    },
    {
      label: 'Company',
      value: selectedCipher.identity.company
    },
    {
      label: 'Social security number',
      value: selectedCipher.identity.ssn
    },
    {
      label: 'Passport number',
      value: selectedCipher.identity.passportNumber
    },
    {
      label: 'License number',
      value: selectedCipher.identity.licenseNumber
    },
    {
      label: 'Address 1',
      value: selectedCipher.identity.address1
    },
    {
      label: 'Address 2',
      value: selectedCipher.identity.address2
    },
    // {
    //   label: 'Address 3',
    //   value: selectedCipher.identity.address3
    // },
    {
      label: 'City / Town',
      value: selectedCipher.identity.city
    },
    {
      label: 'State / Province',
      value: selectedCipher.identity.state
    },
    {
      label: 'Zip / Postal code',
      value: selectedCipher.identity.postalCode
    },
    {
      label: 'Country',
      value: selectedCipher.identity.country
    }
  ]

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
      <IdentityAction
        navigation={navigation}
        isOpen={showAction}
        onClose={setShowAction}
      />

      {/* Intro */}
      <View>
        <View style={[commonStyles.CENTER_VIEW, {
          backgroundColor: color.palette.white,
          paddingTop: 20,
          paddingBottom: 30,
          marginBottom: 10
        }]}>
          <Image
            source={BROWSE_ITEMS.indentity.icon}
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
        {
          textFields.map((item, index) => (
            <FloatingInput
              key={index}
              fixedLabel
              copyAble={!!item.value}
              label={item.label}
              value={item.value}
              editable={false}
            />
          ))
        }

        {/* Notes */}
        <FloatingInput
          label="Notes"
          value={selectedCipher.notes}
          editable={false}
          textarea
          fixedLabel
          copyAble
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
