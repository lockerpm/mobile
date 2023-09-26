/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Image, View } from 'react-native'
import { NoteAction } from '../NoteAction'
import { AppStackScreenProps, BROWSE_ITEMS } from 'app/navigators'
import { useStores } from 'app/models'
import { Header, Icon, Screen, Text } from 'app/components-v2/cores'
import { useTheme } from 'app/services/context'
import { CipherInfoCommon, DeletedAction } from 'app/components-v2/ciphers'
import { Textarea } from 'app/components-v2/utils'
import { translate } from 'app/i18n'

export const NoteInfoScreen: FC<AppStackScreenProps<'notes__info'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { colors } = useTheme()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
    selectedCipher.id
  )

  const [showAction, setShowAction] = useState(false)

  const fromQuickShare = route.params?.quickShare
  return (
    <Screen
      preset="auto"
      safeAreaEdges={['bottom']}
      backgroundColor={colors.block}
      contentContainerStyle={{
        flex: 1,
      }}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          rightIcon={!fromQuickShare ? 'dots-three' : undefined}
          onRightPress={() => setShowAction(true)}
        />
      }
    >
      {selectedCipher.deletedDate ? (
        <DeletedAction
          navigation={navigation}
          isOpen={showAction}
          onClose={() => setShowAction(false)}
        />
      ) : (
        <NoteAction
          navigation={navigation}
          isOpen={showAction}
          onClose={() => setShowAction(false)}
        />
      )}

      <View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: colors.background,
            paddingTop: 20,
            paddingBottom: 30,
            marginBottom: 10,
          }}
        >
          <Image
            source={BROWSE_ITEMS.note.icon}
            style={{
              width: 55,
              height: 55,
            }}
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
          padding: 16,
          paddingVertical: 22,
        }}
      >
        <Textarea
          label={translate('common.notes')}
          value={selectedCipher.notes}
          editable={false}
          copyAble
        />

        <CipherInfoCommon cipher={selectedCipher} />
      </View>
    </Screen>
  )
})
