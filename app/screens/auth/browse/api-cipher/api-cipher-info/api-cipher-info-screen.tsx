import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Button, Text, FloatingInput, CipherInfoCommon, Textarea } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { CipherView } from "../../../../../../core/models/view"
import { useStores } from "../../../../../models"
import { DeletedAction } from "../../../../../components/cipher/cipher-action/deleted-action"
import { useMixins } from "../../../../../services/mixins"
import { toApiCipherData } from "../api-cipher.type"
import { ApiCipherAction } from "../api-cipher-action"


export const ApiCipherInfoScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  const { cipherStore } = useStores()

  const selectedCipher: CipherView = cipherStore.cipherView
  const apiCipherData = toApiCipherData(selectedCipher.notes)

  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(selectedCipher.id)

  const [showAction, setShowAction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const textFields = [
    {
      label: translate('API.url'),
      value: apiCipherData.url,
      isRequired: true
    },
    {
      label: translate('API.method'),
      value: apiCipherData.method.toUpperCase()
    },
    {
      label: translate('API.header'),
      value: apiCipherData.header
    },
    {
      label: translate('API.body_data'),
      value: apiCipherData.bodyData
    },
    {
      label: translate('API.response'),
      value: apiCipherData.response
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
              style={{ 
                height: 35,
                alignItems: 'center',
                paddingLeft: 10
              }}
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
          <ApiCipherAction
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
          <BROWSE_ITEMS.apiCipher.svgIcon height={55} width={55} />
          <Text
            preset="header"
            style={{ marginTop: 10, marginHorizontal: 20, textAlign: 'center' }}
          >
            {selectedCipher.name}
            {
              notSync && (
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
        <Textarea
          label={translate('common.notes')}
          value={apiCipherData.notes}
          editable={false}
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
