/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Image, View } from 'react-native'
import { IdentityAction } from '../IdentityAction'
import { AppStackScreenProps, BROWSE_ITEMS } from 'app/navigators'
import { useStores } from 'app/models'
import { CipherView } from 'core/models/view'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'
import { Header, Icon, Screen, Text, TextInput } from 'app/components/cores'
import { CipherInfoCommon, DeletedAction } from 'app/components/ciphers'
import { Textarea } from 'app/components/utils'

export const IdentityInfoScreen: FC<AppStackScreenProps<'identities__info'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { cipherStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView
  const { colors } = useTheme()

  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
    selectedCipher.id
  )

  const [showAction, setShowAction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fromQuickShare = route.params?.quickShare

  const textFields = [
    {
      label: translate('identity.title'),
      value: selectedCipher.identity.title,
    },
    {
      label: translate('identity.first_name'),
      value: selectedCipher.identity.firstName,
    },
    {
      label: translate('identity.last_name'),
      value: selectedCipher.identity.lastName,
    },
    {
      label: translate('identity.username'),
      value: selectedCipher.identity.username,
    },
    {
      label: translate('identity.email'),
      value: selectedCipher.identity.email,
    },
    {
      label: translate('identity.company'),
      value: selectedCipher.identity.company,
    },
    {
      label: translate('identity.phone'),
      value: selectedCipher.identity.phone,
    },
    {
      label: translate('identity.ssn'),
      value: selectedCipher.identity.ssn,
    },
    {
      label: translate('identity.passport'),
      value: selectedCipher.identity.passportNumber,
    },
    {
      label: translate('identity.license'),
      value: selectedCipher.identity.licenseNumber,
    },
    {
      label: translate('identity.address') + ' 1',
      value: selectedCipher.identity.address1,
    },
    {
      label: translate('identity.address') + ' 2',
      value: selectedCipher.identity.address2,
    },
    // {
    //   label: translate('identity.address') + ' 3',
    //   value: selectedCipher.identity.address3
    // },
    {
      label: translate('identity.city'),
      value: selectedCipher.identity.city,
    },
    {
      label: translate('identity.state'),
      value: selectedCipher.identity.state,
    },
    {
      label: translate('identity.zip'),
      value: selectedCipher.identity.postalCode,
    },
    {
      label: translate('identity.country'),
      value: selectedCipher.identity.country,
    },
  ]

  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={['bottom']}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          rightIcon={!fromQuickShare ? 'dots-three' : undefined}
          onRightPress={() => setShowAction(true)}
        />
      }
    >
      {/* Actions */}
      {selectedCipher.deletedDate ? (
        <DeletedAction
          navigation={navigation}
          isOpen={showAction}
          onClose={() => setShowAction(false)}
        />
      ) : (
        <IdentityAction
          navigation={navigation}
          isOpen={showAction}
          onClose={() => setShowAction(false)}
          onLoadingChange={setIsLoading}
        />
      )}


      <Image
        source={BROWSE_ITEMS.identity.icon}
        style={{
          height: 55, width: 55, alignSelf: 'center'
        }}
      />
      <Text
        preset="bold"
        size="xxl"
        style={{ margin: 20, textAlign: 'center' }}
      >
        {selectedCipher.name}
        {notSync && (
          <View style={{ paddingLeft: 10 }}>
            <Icon icon="wifi-slash" size={22} />
          </View>
        )}
      </Text>

      {textFields.map((item, index) => (
        <TextInput
          animated
          key={index}
          isCopyable={!!item.value}
          label={item.label}
          value={item.value}
          editable={false}
          style={index !== 0 ? { marginVertical: 10 } : { marginBottom: 10 }}
        />
      ))}

      {/* Notes */}
      <Textarea
        label={translate('common.notes')}
        value={selectedCipher.notes}
        editable={false}
        copyAble
        style={{ marginTop: 10 }}
      />

      <CipherInfoCommon cipher={selectedCipher} />
    </Screen>
  )
})
