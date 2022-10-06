import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Layout, Header, Text } from '../../../../../../components'
import { useNavigation } from '@react-navigation/native'
import { SectionWrapperItem } from '../../settings-item'
import { useMixins } from '../../../../../../services/mixins'
import { useStores } from '../../../../../../models'
import { Contact } from '../contact'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { TrustedContact } from '../../../../../../config/types/api'

export const ContactsTrustedYouScreen = observer(function ContactsTrustedYouScreen() {
  const navigation = useNavigation()
  const { translate, color, notifyApiError } = useMixins()
  const { user } = useStores()
  // ----------------------- PARAMS -----------------------
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([])
  const [onAction, setOnAction] = useState(false)
  // ----------------------- METHODS -----------------------

  const granted = async () => {
    const res = await user.grantedEA()
    if (res.kind === 'ok') {
      setTrustedContacts(res.data)
    } else {
      notifyApiError(res)
    }
  }

  // ----------------------- EFFECT -----------------------
  useEffect(() => {
    granted()
  }, [onAction])
  // ----------------------- RENDER -----------------------

  return (
    <Layout
      noScroll
      header={
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('emergency_access.trust_you')}
          right={<View style={{ width: 30 }} />}
        />
      }
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <SectionWrapperItem>
        <FlatList
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={{
                alignItems: 'center',
              }}
            >
              <Text text={'No data'} style={{ textAlign: 'center' }} />
            </View>
          }
          data={trustedContacts}
          keyExtractor={(item, index) => String(index)}
          renderItem={({ item }) => (
            <Contact
              isYourTrusted={false}
              setOnAction={() => {
                setOnAction(!onAction)
              }}
              trustedContact={item}
            />
          )}
        />
      </SectionWrapperItem>
    </Layout>
  )
})
