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
  const { imported, total } = props
  const isAllImported = imported === total

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
          {isAllImported ? (
            <Icon icon={'check'} size={24} color={colors.primary} />
          ) : (
            <Icon icon={'warning'} size={24} color={colors.error} />
          )}
          <Text
            preset="bold"
            text={`${props.imported}/${props.total} ` + translate('import.imported_free.result')}
            style={{
              color: isAllImported ? colors.primary : colors.error,
              marginLeft: 10,
            }}
          />
        </View>
        {isAllImported && (
          <Button
            text={translate('import.result_btn')}
            onPress={() => navigation.navigate('mainTab', {})}
            style={{
              marginHorizontal: 20,
              marginTop: 30,
              marginBottom: 10,
            }}
          />
        )}
      </View>
    </View>
  )
}
