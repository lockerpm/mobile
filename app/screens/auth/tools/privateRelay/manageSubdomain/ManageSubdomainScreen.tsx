import React, { FC, useEffect, useState } from 'react'
import { View } from 'react-native'
import moment from 'moment'
import { Screen, Header, Text, Toggle } from 'app/components/cores'
import { ToolsStackScreenProps } from 'app/navigators'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { SubdomainData } from 'app/static/types'
import { translate } from 'app/i18n'

import { EditSubdomainModal } from './EditSubdomainModal'
import { observer } from 'mobx-react-lite'

export const ManageSubdomainScreen: FC<ToolsStackScreenProps<'manageSubdomain'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route
  const { colors } = useTheme()
  const { notifyApiError } = useHelper()
  const { toolStore } = useStores()

  const [showEditModal, setShowEditModal] = useState(false)
  const [subdomain, setSubdomain] = useState<SubdomainData>(route.params.subdomain)
  const [useSubdomain, setUseSubdomain] = useState(false)

  const data = [
    {
      label: translate('private_relay.manage_subdomain.your_subdomain'),
      data: subdomain.subdomain,
    },
    {
      label: translate('private_relay.manage_subdomain.num_alias'),
      data: subdomain.num_alias.toString(),
    },
    {
      label: translate('private_relay.manage_subdomain.block_email'),
      data: subdomain.num_spam.toString(),
    },
    {
      label: translate('private_relay.manage_subdomain.forwarded_email'),
      data: subdomain.num_forwarded.toString(),
    },
    {
      label: translate('private_relay.manage_subdomain.create_date'),
      data: moment.unix(subdomain.created_time).format('DD/MM/YYYY'),
    },
  ]

  const useSubdomainForGenerate = async () => {
    const res = await toolStore.useSubdomain(useSubdomain)
    if (res.kind !== 'ok') {
      notifyApiError(res)
    }
  }

  const fetchUseSubdomain = async () => {
    const res = await toolStore.fetchUseSubdomain()
    if (res.kind === 'ok') {
      setUseSubdomain(res.data)
    }
  }

  useEffect(() => {
    fetchUseSubdomain()
  }, [])

  useEffect(() => {
    useSubdomainForGenerate()
  }, [useSubdomain])

  // Render
  return (
    <Screen
      preset="auto"
      safeAreaEdges={['bottom']}
      padding
      header={
        <Header
          title={translate('private_relay.manage_subdomain.title')}
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          rightIcon="edit"
          onRightPress={() => setShowEditModal(true)}
        />
      }
    >
      <EditSubdomainModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        subdomain={subdomain}
        setSubdomain={setSubdomain}
      />

      {data.map((item, index) => (
        <View key={index}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 16,
              borderBottomColor: colors.border,
              borderBottomWidth: 1,
            }}
          >
            <Text preset="label" text={item.label} />
            <Text text={item.data} />
          </View>
        </View>
      ))}

      {/** Enable use subdomain to generte future aliases */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 22,
        }}
      >
        <Text
          text={translate('private_relay.manage_subdomain.use_subdomain')}
          style={{ maxWidth: '85%' }}
        />
        <Toggle variant="switch" value={useSubdomain} onValueChange={setUseSubdomain} />
      </View>
    </Screen>
  )
})
