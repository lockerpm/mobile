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
import { toDriverLicenseData } from "../driver-license.type"


export const DriverLicenseInfoScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  const { cipherStore } = useStores()

  const selectedCipher: CipherView = cipherStore.cipherView
  const driverLicenseData = toDriverLicenseData(selectedCipher.notes)

  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(selectedCipher.id)

  const [showAction, setShowAction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const textFields = [
    {
      label: translate('driver_license.no'),
      value: driverLicenseData.idNO
    },
    {
      label: translate('common.fullname'),
      value: driverLicenseData.fullName
    },
    {
      label: translate('common.dob'),
      value: driverLicenseData.dob
    },
    {
      label: translate('common.address'),
      value: driverLicenseData.address
    },
    {
      label: translate('common.nationality'),
      value: driverLicenseData.nationality
    },
    {
      label: translate('driver_license.class'),
      value: driverLicenseData.class
    },
    {
      label: translate('driver_license.valid_until'),
      value: driverLicenseData.validUntil
    },
    {
      label: translate('driver_license.vehicle_class'),
      value: driverLicenseData.vehicleClass
    },
    {
      label: translate('driver_license.beginning_date'),
      value: driverLicenseData.beginningDate
    },
    {
      label: translate('driver_license.issued_by'),
      value: driverLicenseData.issuedBy
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
          null
        //   <IdentityAction
        //     navigation={navigation}
        //     isOpen={showAction}
        //     onClose={() => setShowAction(false)}
        //     onLoadingChange={setIsLoading}
        //   />
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
          value={driverLicenseData.notes}
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
