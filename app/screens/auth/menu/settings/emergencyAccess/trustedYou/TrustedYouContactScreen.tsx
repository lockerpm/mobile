import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { Contact } from '../Contact'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { Header, Screen, Text } from 'app/components-v2/cores'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { TrustedContact } from 'app/static/types'
import { translate } from 'app/i18n'

export const ContactsTrustedYouScreen = observer(function ContactsTrustedYouScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { notifyApiError } = useHelper()
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
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('emergency_access.trust_you')}
        />
      }
      backgroundColor={colors.block}
    >
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
    </Screen>
  )
})
