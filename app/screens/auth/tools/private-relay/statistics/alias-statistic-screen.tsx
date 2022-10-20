import React from 'react'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Layout, Header, Text, Divider } from '../../../../../components'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useMixins } from '../../../../../services/mixins'
import { PrimaryParamList } from '../../../../../navigators'
import moment from 'moment'


type AliasStatisticScreenProp = RouteProp<PrimaryParamList, "aliasStatistic">


export const AliasStatisticScreen = observer(() => {
  const navigation = useNavigation()
  const { translate } = useMixins()
  const route = useRoute<AliasStatisticScreenProp>()

  const alias = route.params.alias

  const data = [
    {
      label: translate('private_relay.title'),
      data: alias.full_address
    },
    {
      label: translate('private_relay.manage_subdomain.block_email'),
      data: alias.num_blocked.toString()
    },
    {
      label: translate('private_relay.manage_subdomain.forwarded_email'),
      data: alias.num_forwarded.toString()
    },
    {
      label: translate('private_relay.manage_subdomain.create_date'),
      data: moment.unix(alias.created_time).format('DD/MM/YYYY')
    }
  ]

// Render
return (
  <Layout
    header={
      <Header
        title={"Statistic"}
        goBack={() => navigation.goBack()}
        right={(
          <View style={{ width: 30 }} />
        )}
      />
    }
  >
    {data.map((item, index) => (
      <View
        key={index}
      >
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginVertical: 16,
        }}>
          <Text text={item.label} />
          <Text preset='black' text={item.data} />
        </View>

        <Divider />
      </View>
    ))}
  </Layout >
)
})
