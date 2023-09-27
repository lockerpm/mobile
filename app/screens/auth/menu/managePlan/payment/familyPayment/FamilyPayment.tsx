import React from 'react'
import { View, Image } from 'react-native'
import { Subscription } from 'react-native-iap'
import { SKU } from '../PricePlan.sku'
import { Text, Button, Icon } from 'app/components-v2/cores'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'

interface Props {
  isTrial: boolean
  subscriptions: Subscription[]
  onPress: React.Dispatch<React.SetStateAction<boolean>>
  purchase: (subID: string) => void
  isEnable: boolean
  isProcessPayment: boolean
}
const SECURITY = require('assets/images/intro/intro1.png')

export const FamilyPayment = (props: Props) => {
  const { colors } = useTheme()

  const benefits = [
    {
      preset: 'black',
      text: translate('payment.family.benefits.family'),
    },
    {
      text: translate('payment.family.benefits.storage'),
    },
    {
      text: translate('payment.family.benefits.health'),
    },
    {
      text: translate('payment.family.benefits.weak'),
    },
    {
      text: translate('payment.family.benefits.scaner'),
    },
    {
      text: translate('payment.family.benefits.emergency'),
    },
    {
      text: translate('payment.family.benefits.share'),
    },
  ]

  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <Image
          source={SECURITY}
          style={{
            width: 200,
            height: 200,
          }}
        />
        <Text preset="bold" text={translate('payment.family.header')} />
        <Text
          text={translate('payment.family.ads')}
          style={{
            textAlign: 'center',
            marginTop: 8,
            marginHorizontal: 20,
          }}
        />
      </View>

      <View
        style={{
          borderRadius: 12,
          backgroundColor: colors.block,
          marginVertical: 16,
          marginHorizontal: 20,
          paddingHorizontal: 16,
        }}
      >
        {benefits.map((e, index) => (
          <View
            key={String(index)}
            style={{
              flexDirection: 'row',
              marginVertical: 6,
            }}
          >
            <Icon icon="check" size={20} />
            <Text
              text={e.text}
              preset={e.preset ? 'default' : 'label'}
              style={{ marginLeft: 12 }}
            />
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: colors.background, marginHorizontal: 20 }}>
        <Button
          preset="secondary"
          style={{
            marginVertical: 10,
          }}
          loading={props.isProcessPayment}
          onPress={() => {
            props.purchase(SKU.FAM_MON)
          }}
        >
          <Text preset="bold" style={{ color: colors.primary }}>
            {props.isProcessPayment ? '' : translate('payment.family.month')}
          </Text>
        </Button>
        <Button
          style={{
            marginVertical: 10,
          }}
          loading={props.isProcessPayment}
          onPress={() => {
            props.purchase(SKU.FAM_YEAR)
          }}
        >
          <Text preset="bold" style={{ color: colors.white }}>
            {props.isProcessPayment ? '' : translate('payment.family.year')}
          </Text>
        </Button>
      </View>
    </View>
  )
}
