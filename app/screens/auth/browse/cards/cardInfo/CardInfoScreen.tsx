/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { View, Image } from 'react-native'
import { CardAction } from '../CardAction'
import { CARD_BRANDS } from '../constants'
import { AppStackScreenProps, BROWSE_ITEMS } from 'app/navigators'
import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { CipherView } from 'core/models/view'

import { Header, Icon, Screen, Text, TextInput } from 'app/components/cores'
import { CipherInfoCommon, DeletedAction } from 'app/components/ciphers'
import { Textarea } from 'app/components/utils'
import { useHelper } from 'app/services/hook'

export const CardInfoScreen: FC<AppStackScreenProps<'cards__info'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { cipherStore } = useStores()
  const { colors } = useTheme()
  const { translate } = useHelper()

  const selectedCipher: CipherView = cipherStore.cipherView

  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
    selectedCipher.id
  )

  const [showAction, setShowAction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fromQuickShare = route.params?.quickShare

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
        <CardAction
          navigation={navigation}
          isOpen={showAction}
          onClose={() => setShowAction(false)}
          onLoadingChange={setIsLoading}
        />
      )}

      <Image
        source={BROWSE_ITEMS.card.icon}
        style={{ height: 55, width: 55, alignSelf: 'center' }}
      />
      <Text preset="bold" size="xxl" style={{ margin: 20, textAlign: 'center' }}>
        {selectedCipher.name}
        {notSync && (
          <View style={{ paddingLeft: 10 }}>
            <Icon icon="wifi-slash" size={22} />
          </View>
        )}
      </Text>

      <TextInput
        isCopyable
        label={translate('card.card_name')}
        value={selectedCipher.card.cardholderName}
        editable={false}
        containerStyle={{ marginBottom: 16 }}
      />

      <TextInput
        isCopyable
        label={translate('card.brand')}
        value={
          (CARD_BRANDS.find((i) => i.value === selectedCipher.card.brand) || { label: '' }).label
        }
        editable={false}
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Number */}
      <TextInput
        isCopyable
        label={translate('card.card_number')}
        value={selectedCipher.card.number}
        editable={false}
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Exp date */}
      <TextInput
        isCopyable
        label={translate('card.exp_date')}
        value={`${selectedCipher.card.expMonth}/${selectedCipher.card.expYear}`}
        editable={false}
        containerStyle={{ marginBottom: 16 }}
      />

      {/* CVV */}
      <TextInput
        isCopyable
        isPassword
        label={translate('card.cvv')}
        value={selectedCipher.card.code}
        editable={false}
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Notes */}
      <Textarea
        label={translate('common.notes')}
        value={selectedCipher.notes || '123'}
        editable={false}
        copyAble
        style={{ marginTop: 10 }}
      />

      {/* Others common info */}
      <CipherInfoCommon cipher={selectedCipher} />
    </Screen>
  )
})
