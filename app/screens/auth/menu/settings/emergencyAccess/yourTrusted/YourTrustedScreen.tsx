import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { AddTrustedContactModal } from './AddTrustedContactModal'
import { Contact } from '../Contact'
import { FlatList, View } from 'react-native'
import { Button, Header, Screen, Text } from 'app/components/cores'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { TrustedContact } from 'app/static/types'
import { translate } from 'app/i18n'

export const YourTrustedContactScreen = () => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { notifyApiError } = useHelper()
  const { user } = useStores()

  const isFree = user.isFreePlan

  // ----------------------- PARAMS -----------------------
  const [isShowAddModal, setIsShowAddModal] = useState(false)
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([])
  const [onAction, setOnAction] = useState(false)
  // ----------------------- METHODS -----------------------

  const trusted = async () => {
    const res = await user.trustedEA()
    if (res.kind === 'ok') {
      setTrustedContacts(res.data)
    } else {
      notifyApiError(res)
    }
  }

  // ----------------------- EFFECT -----------------------
  useEffect(() => {
    trusted()
  }, [onAction])

  // ----------------------- RENDER -----------------------

  const ListEmpty = () => (
    <View>
      {isFree && (
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <Text text={translate('emergency_access.free_guild')} style={{ textAlign: 'center' }} />
        </View>
      )}
      {!isFree && (
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <Text text={'No data'} style={{ textAlign: 'center' }} />
        </View>
      )}
    </View>
  )

  return (
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('emergency_access.title')}
          RightActionComponent={
            <Button
              disabled={isFree}
              onPress={() => setIsShowAddModal(true)}
              preset="teriatary"
              text={translate('common.add')}
            />
          }
        />
      }
      backgroundColor={colors.block}
    >
      <AddTrustedContactModal
        onAction={() => {
          setOnAction(!onAction)
        }}
        isShow={isShowAddModal}
        onClose={() => {
          setIsShowAddModal(false)
          setOnAction(!onAction)
        }}
      />
      <FlatList
        ListEmptyComponent={<ListEmpty />}
        data={trustedContacts}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => (
          <Contact
            isYourTrusted={true}
            setOnAction={() => {
              setOnAction(!onAction)
            }}
            trustedContact={item}
          />
        )}
      />
    </Screen>
  )
}
