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
import { translate } from 'app/i18n'
import { Textarea } from 'app/components/utils'

export const CardInfoScreen: FC<AppStackScreenProps<'cards__info'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { cipherStore } = useStores()
  const { colors } = useTheme()

  const selectedCipher: CipherView = cipherStore.cipherView

  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
    selectedCipher.id
  )

  const [showAction, setShowAction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fromQuickShare = route.params?.quickShare

  return (
    <Screen
      backgroundColor={colors.block}
      header={
        !fromQuickShare && (
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => navigation.goBack()}
            RightActionComponent={
              <Icon
                icon="dots-three"
                size={24}
                style={{
                  alignItems: 'center',
                  paddingLeft: 20,
                }}
                onPress={() => setShowAction(true)}
              />
            }
          />
        )
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

      <View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 20,
            paddingBottom: 30,
            marginBottom: 10,
          }}
        >
          <Image
            source={BROWSE_ITEMS.card.icon}
            style={{ height: 55, width: 55, marginBottom: 5 }}
          />
          <Text
            preset="bold"
            size="xl"
            style={{ marginTop: 10, marginHorizontal: 20, textAlign: 'center' }}
          >
            {selectedCipher.name}
            {notSync && (
              <View style={{ paddingLeft: 10 }}>
                <Icon icon="wifi-slash" size={22} />
              </View>
            )}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.background,
          paddingVertical: 22,
          padding: 16,
        }}
      >
        <TextInput
          isCopyable
          label={translate('card.card_name')}
          value={selectedCipher.card.cardholderName}
          editable={false}
          style={{ marginBottom: 10 }}
        />

        {/* Brand */}
        <TextInput
          isCopyable
          label={translate('card.brand')}
          value={
            (CARD_BRANDS.find((i) => i.value === selectedCipher.card.brand) || { label: '' }).label
          }
          editable={false}
          style={{ marginVertical: 10 }}
        />

        {/* Number */}
        <TextInput
          isCopyable
          label={translate('card.card_number')}
          value={selectedCipher.card.number}
          editable={false}
          style={{ marginVertical: 10 }}
        />

        {/* Exp date */}
        <TextInput
          isCopyable
          label={translate('card.exp_date')}
          value={`${selectedCipher.card.expMonth}/${selectedCipher.card.expYear}`}
          editable={false}
          style={{ marginVertical: 10 }}
        />

        {/* CVV */}
        <TextInput
          isCopyable
          isPassword
          label={translate('card.cvv')}
          value={selectedCipher.card.code}
          editable={false}
          style={{ marginVertical: 10 }}
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
      </View>
    </Screen>
  )
})
