import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Layout, Header, Text, Divider } from '../../../../../components'
import { useNavigation } from '@react-navigation/native'
import { useMixins } from '../../../../../services/mixins'

export const AliasStatisticScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()

  const [alias, setAlias] = useState("asdasdasd")
  const [blockEmails, setBlockEmails] = useState("asd")
  const [forwardEmails, setForwardEmails] = useState("asd")
  const [createDate, setCreateDate] = useState("asd")

  const mounted = async () => {
    //
  }

  const data = [
    {
      label: translate('private_relay.title'),
      data: alias
    },
    {
      label: translate('private_relay.manage_subdomain.block_email'),
      data: blockEmails
    },
    {
      label: translate('private_relay.manage_subdomain.forwarded_email'),
      data: forwardEmails
    },
    {
      label: translate('private_relay.manage_subdomain.create_date'),
      data: createDate
    }
  ]

  useEffect(() => {
    //
  }, [])

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
