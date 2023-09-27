import React, { FC, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { OtpList } from './OtpList'
import { Text, Screen, Header, Icon } from 'app/components/cores'
import { AppStackScreenProps } from 'app/navigators'
import { useStores } from 'app/models'
import { CipherView } from 'core/models/view'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'
import { AuthenticatorAddAction } from 'app/screens/auth/tools/authenticator/AuthenticatorAddAction'
import { SearchBar } from 'app/components/utils'

export const Password2FASetupScreen: FC<AppStackScreenProps<'passwords_2fa_setup'>> = (props) => {
  const navigation: any = props.navigation
  const route = props.route

  const { cipherStore } = useStores()

  const [searchText, setSearchText] = useState('')
  const [selectedOtp, setSelectedOtp] = useState<CipherView>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const { colors } = useTheme()

  return (
    <Screen
      safeAreaEdges={['bottom']}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('password.2fa_setup')}
          rightText={translate('common.save')}
          onRightPress={() => {
            cipherStore.setSelectedTotp(selectedOtp?.notes || '-1')
            navigation.goBack()
          }}
        />
      }
      backgroundColor={colors.block}
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <AuthenticatorAddAction
        passwordTotp
        passwordMode={route.params.mode}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
        allItemsLength={0}
      />
      <View
        style={{
          marginTop: 12,
          backgroundColor: colors.background,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => setSelectedOtp(null)}
        >
          <Text text={translate('password.no_otp')} />
          {selectedOtp === null && <Icon icon="check" size={19} color={colors.primary} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => setIsAddOpen(true)}
        >
          <Text text={translate('password.add_otp')} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          padding: 16,
        }}
      >
        <Text preset="label" text="CHOOSE AN EXISTING OTP" />
      </View>

      <View
        style={{
          backgroundColor: colors.background,
          flex: 1,
          padding: 16,
        }}
      >
        <SearchBar value={searchText} onChangeText={setSearchText} />
        <OtpList
          searchText={searchText}
          sortList={{
            orderField: 'revisionDate',
            order: 'desc',
          }}
          selectedOtp={selectedOtp}
          setSelectedOtp={setSelectedOtp}
        />
      </View>
    </Screen>
  )
}
