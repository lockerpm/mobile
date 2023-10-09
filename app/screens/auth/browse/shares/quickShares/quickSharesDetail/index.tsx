import { useStores } from 'app/models'
import { AppStackScreenProps } from 'app/navigators'
import { useTheme } from 'app/services/context'
import { useCipherHelper, useHelper } from 'app/services/hook'
import moment from 'moment'
import React, { FC } from 'react'
import { TouchableOpacity, View, ViewStyle, Image } from 'react-native'
import { Button, Header, Icon, Screen, Text } from 'app/components/cores'
import { translate } from 'app/i18n'
import { observer } from 'mobx-react-lite'

export const QuickSharesDetailScreen: FC<AppStackScreenProps<'quickShareItemsDetail'>> = observer((
  props
) => {
  const navigation = props.navigation
  const route = props.route

  const { colors } = useTheme()
  const { copyToClipboard } = useHelper()
  const { getCipherInfo, getCipherDescription } = useCipherHelper()
  const { cipherStore } = useStores()

  const send = route.params.send

  const cipherMapper = (() => {
    const cipherInfo = getCipherInfo(send.cipher)
    return cipherInfo
  })()

  const $horizontalStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  }

  return (
    <Screen
      safeAreaEdges={['bottom']}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('quick_shares.detail.tl')}
        />
      }
      footer={
        <View
          style={{
            padding: 16,
          }}
        >
          <Button
            text={translate('quick_shares.action.copy')}
            onPress={() => {
              const url = cipherStore.getPublicShareUrl(send.accessId, send.key)
              copyToClipboard(url)
            }}
          />

          <Button
            preset="secondary"
            text={translate('quick_shares.action.stop')}
            onPress={() => {
              const url = cipherStore.getPublicShareUrl(send.accessId, send.key)
              copyToClipboard(url)
            }}
            textStyle={{
              color: colors.error,
            }}
            style={{
              marginTop: 16,
              borderColor: colors.error,
            }}
          />
        </View>
      }
    >
      <TouchableOpacity
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.block,
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={() => {
          cipherStore.setSelectedCipher(send.cipher)
          // @ts-ignore
          navigation.navigate(`${cipherMapper.path}__info`, { quickShare: true })
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={cipherMapper.img} style={{ height: 40, width: 40, borderRadius: 8 }} />
          <View style={{ marginLeft: 10 }}>
            <Text preset="bold" text={send.cipher.name} numberOfLines={2} />
            {!!getCipherDescription(send.cipher) && (
              <Text size="base" preset="label" text={getCipherDescription(send.cipher)} />
            )}
          </View>
        </View>

        <Icon
          icon="caret-left"
          color={colors.title}
          size={24}
          containerStyle={{
            transform: [
              {
                scaleX: -1,
              },
            ],
          }}
        />
      </TouchableOpacity>
      {!!send.creationDate && (
        <View style={$horizontalStyle}>
          <Text preset="label" text={translate('quick_shares.detail.share_time')} />
          <Text text={moment.unix(send.creationDate.getTime() / 1000).fromNow()} />
        </View>
      )}

      <View style={$horizontalStyle}>
        <Text text={translate('quick_shares.detail.share_with')} />
        <View>
          {send.emails?.map((e) => (
            <Text key={e} text={e} />
          ))}
          {!send.emails ||
            (send.emails.length === 0 && <Text text={translate('quick_shares.detail.anyone')} />)}
        </View>
      </View>

      {!!send.accessCount && (
        <View style={$horizontalStyle}>
          <Text preset="label" text={translate('quick_shares.detail.View')} />
          <Text text={`${send.accessCount}`} />
        </View>
      )}

      {!!send.expirationDate && (
        <View style={$horizontalStyle}>
          <Text preset="label" text={translate('quick_shares.detail.expire')} />
          <Text
            text={moment
              .unix(send.expirationDate.getTime() / 1000)
              .format('Do MMM YYYY, h:mm:ss A')}
          />
        </View>
      )}
    </Screen>
  )
})
