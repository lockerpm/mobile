import React, { useState } from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { BottomModal, Button, Icon, Text } from 'app/components/cores'
import { useHelper } from 'app/services/hook'

interface Props {
  imported: number
  total: number
  isLimited?: boolean
  setIsLimited: (val: boolean) => void
}

const LOCKER_IMG = require('assets/images/intro/locker.png')

export const ImportResult = (props: Props) => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { translate } = useHelper()
  const { user } = useStores()
  const { imported, total, isLimited, setIsLimited } = props
  const isFreeAccount = user.isFreePlan
  const isAllImported = imported === total
  const [isFree, setIsFree] = useState(true)

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

      {!isAllImported && isFree && (
        <View
          style={{
            marginTop: 16,
            borderWidth: 1,
            borderColor: colors.palette.orange10,
            backgroundColor: colors.palette.orange4,
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 16,
            paddingHorizontal: 20,
            width: '100%',
          }}
        >
          <View style={{ marginRight: 36 }}>
            <Text text={translate('import.imported_free.guild')} style={{ color: colors.black }} />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('payment')
              }}
            >
              <Text
                weight="semibold"
                style={{
                  color: colors.primary,
                }}
              >
                Upgrade to Premium
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              setIsFree(false)
            }}
          >
            <Icon icon="x" size={24} color={'black'} />
          </TouchableOpacity>
        </View>
      )}

      <BottomModal
        title={translate('import.limited')}
        isOpen={isLimited && isFreeAccount}
        onClose={() => {
          setIsLimited(false)
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Image source={LOCKER_IMG} style={{ height: 60, width: 60, marginBottom: 12 }} />
          <Text
            text={`${imported}/${total} ` + translate('import.imported_free.note')}
            style={{ maxWidth: '90%', textAlign: 'center', marginBottom: 16 }}
          />

          <Button
            text="Get Unlimited"
            onPress={() => {
              setIsLimited(false)
              navigation.navigate('payment')
            }}
            style={{ marginBottom: 50, width: '90%' }}
          />
        </View>
      </BottomModal>
    </View>
  )
}
