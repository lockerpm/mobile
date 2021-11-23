import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Button, Text, FloatingInput, CipherInfoCommon } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color as colorLight, colorDark, commonStyles } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { IdentityAction } from "../identity-action"
import { CipherView } from "../../../../../../core/models/view"
import { useStores } from "../../../../../models"
import { DeletedAction } from "../../../../../components/cipher/cipher-action/deleted-action"
import { useMixins } from "../../../../../services/mixins"


export const IdentityInfoScreen = observer(function IdentityInfoScreen() {
  const navigation = useNavigation()
  const { cipherStore, uiStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView
  const { translate } = useMixins()
  const color = uiStore.isDark ? colorDark : colorLight

  const [showAction, setShowAction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const textFields = [
    {
      label: translate('identity.title'),
      value: selectedCipher.identity.title
    },
    {
      label: translate('identity.first_name'),
      value: selectedCipher.identity.firstName
    },
    {
      label: translate('identity.last_name'),
      value: selectedCipher.identity.lastName
    },
    {
      label: translate('identity.username'),
      value: selectedCipher.identity.username
    },
    {
      label: translate('identity.email'),
      value: selectedCipher.identity.email
    },
    {
      label: translate('identity.company'),
      value: selectedCipher.identity.company
    },
    {
      label: translate('identity.phone'),
      value: selectedCipher.identity.phone
    },
    {
      label: translate('identity.ssn'),
      value: selectedCipher.identity.ssn
    },
    {
      label: translate('identity.passport'),
      value: selectedCipher.identity.passportNumber
    },
    {
      label: translate('identity.license'),
      value: selectedCipher.identity.licenseNumber
    },
    {
      label: translate('identity.address') + ' 1',
      value: selectedCipher.identity.address1
    },
    {
      label: translate('identity.address') + ' 2',
      value: selectedCipher.identity.address2
    },
    // {
    //   label: translate('identity.address') + ' 3',
    //   value: selectedCipher.identity.address3
    // },
    {
      label: translate('identity.city'),
      value: selectedCipher.identity.city
    },
    {
      label: translate('identity.state'),
      value: selectedCipher.identity.state
    },
    {
      label: translate('identity.zip'),
      value: selectedCipher.identity.postalCode
    },
    {
      label: translate('identity.country'),
      value: selectedCipher.identity.country
    }
  ]

  return (
    <Layout
      isContentOverlayLoading={isLoading}
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
            onLoadingChange={setIsLoading}
          />
        ) : (
          <IdentityAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
            onLoadingChange={setIsLoading}
          />
        )
      }
      {/* Actions end */}

      {/* Intro */}
      <View>
        <View style={[commonStyles.CENTER_VIEW, {
          backgroundColor: color.background,
          paddingTop: 20,
          paddingBottom: 30,
          marginBottom: 10
        }]}>
          <BROWSE_ITEMS.identity.svgIcon height={55} width={55} />
          <Text
            preset="header"
            style={{ marginTop: 5 }}
          >
            {selectedCipher.name}
            {
              cipherStore.notSynchedCiphers.includes(selectedCipher.id) && (
                <View style={{ paddingLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="cloud-off-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )
            }
          </Text>
        </View>
      </View>
      {/* Intro end */}

      {/* Info */}
      <View style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
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
              style={index !== 0 ? { marginVertical: 10 } : { marginBottom: 10 }}
            />
          ))
        }

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
