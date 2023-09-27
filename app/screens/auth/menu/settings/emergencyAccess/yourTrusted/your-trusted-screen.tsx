import React, { useEffect, useState } from 'react'
import { Layout, Header, Button, Text } from '../../../../../../components'
import { useNavigation } from '@react-navigation/native'
import { useMixins } from '../../../../../../services/mixins'
import { AddTrustedContactModal } from './AddTrustedContactModal'
import { useStores } from '../../../../../../models'
import { Contact } from '../Contact'
import { FlatList, View } from 'react-native'
import { TrustedContact } from '../../../../../../config/types/api'

export const YourTrustedContactScreen = () => {
  const navigation = useNavigation()
  const { translate, color, notifyApiError } = useMixins()
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
          <Text
            text={translate('emergency_access.free_guild')}
            style={{ textAlign: 'center' }}
          />
          {/* <Button
            onPress={() => navigation.navigate('payment', { premium: true })}
            text={translate('common.upgrade')}
            style={{ maxWidth: 150, marginTop: 20 }}
          /> */}
        </View>
      )}
      {!isFree && (
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <Text text={'No data'} style={{ textAlign: 'center' }} />
          {/* <Button text={translate('common.upgrade')} style={{ maxWidth: 150, marginTop: 20 }} /> */}
        </View>
      )}
    </View>
  )

  return (
    <Layout
      noScroll
      header={
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('emergency_access.title')}
          right={
            <Button
              isDisabled={isFree}
              onPress={() => setIsShowAddModal(true)}
              preset="link"
              text={translate('common.add')}
            />
          }
        />
      }
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
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
    </Layout>
  )
}
