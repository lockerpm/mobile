import React from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'app/services/context'
import { Button, Icon, Text } from 'app/components/cores'
import { useHelper } from 'app/services/hook'

interface Props {
  imported: number
  total: number
  isLimited?: boolean
  setIsLimited: (val: boolean) => void
}

export const ImportResult = (props: Props) => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { translate } = useHelper()

  return (
    <View>
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <Icon icon="check" size={32} color={colors.primary} />
        <Text
          preset="bold"
          text={translate('import.imported')}
          style={{ marginTop: 8, marginBottom: 16 }}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Icon icon={'check'} size={24} color={colors.primary} />
          <Text
            preset="bold"
            text={`${props.imported}/${props.total} ` + translate('common.items')}
            style={{
              color: colors.primary,
              marginLeft: 10,
            }}
          />
        </View>
          <Button
            text={translate('import.result_btn')}
            onPress={() => navigation.navigate('mainTab', {})}
            style={{
              marginHorizontal: 20,
              marginTop: 30,
              marginBottom: 10,
            }}
          />
      </View>
    </View>
  )
}
