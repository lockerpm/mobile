import React, { FC } from 'react'
import moment from 'moment'
import { View } from 'react-native'
import { Screen, Header, Text } from 'app/components/cores'
import { ToolsStackScreenProps } from 'app/navigators'
import { observer } from 'mobx-react-lite'
import { useHelper } from 'app/services/hook'

export const AliasStatisticScreen: FC<ToolsStackScreenProps<'aliasStatistic'>> = observer(
  (props) => {
    const navigation = props.navigation
    const route = props.route

    const { translate } = useHelper()

    const alias = route.params.alias

    const data = [
      {
        label: translate('private_relay.title'),
        data: alias.full_address,
      },
      {
        label: translate('private_relay.manage_subdomain.block_email'),
        data: alias.num_blocked.toString(),
      },
      {
        label: translate('private_relay.manage_subdomain.forwarded_email'),
        data: alias.num_forwarded.toString(),
      },
      {
        label: translate('private_relay.manage_subdomain.create_date'),
        data: moment.unix(alias.created_time).format('DD/MM/YYYY'),
      },
    ]

    // Render
    return (
      <Screen
        padding
        header={
          <Header
            title={'Statistic'}
            leftIcon="arrow-left"
            onLeftPress={() => navigation.goBack()}
          />
        }
      >
        {data.map((item, index) => (
          <View key={index}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginVertical: 16,
              }}
            >
              <Text preset="label" text={item.label} />
              <Text
                text={item.data}
                style={{
                  maxWidth: '50%',
                }}
              />
            </View>
          </View>
        ))}
      </Screen>
    )
  }
)
