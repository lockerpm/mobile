import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {  View } from 'react-native'
import { Layout, Header, Text,  Button,  Divider } from '../../../../../components'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useMixins } from '../../../../../services/mixins'
import { Switch } from 'react-native-ui-lib'
import { EditSubdomainModal } from './edit-subdomain-modal'
import { useStores } from '../../../../../models'
import { PrimaryParamList } from '../../../../../navigators'
import { SubdomainData } from '../../../../../config/types/api'
import moment from 'moment'


type ManageSubdomainScreenProp = RouteProp<PrimaryParamList, "manageSubdomain">

export const ManageSubdomainScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color, notifyApiError } = useMixins()
  const { toolStore } = useStores()
  const route = useRoute<ManageSubdomainScreenProp>()
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [subdomain, setSubdomain] = useState<SubdomainData>(route.params.subdomain)
  const [useSubdomain, setUseSubdomain] = useState(false)


  const data = [
    {
      label: translate('private_relay.manage_subdomain.your_subdomain'),
      data: subdomain.subdomain
    },
    {
      label:translate('private_relay.manage_subdomain.num_alias'),
      data: subdomain.num_alias.toString()
    },
    {
      label:translate('private_relay.manage_subdomain.block_email'),
      data: subdomain.num_spam.toString()
    },
    {
      label: translate('private_relay.manage_subdomain.forwarded_email'),
      data: subdomain.num_forwarded.toString()
    },
    {
      label: translate('private_relay.manage_subdomain.create_date'),
      data: moment.unix(subdomain.created_time).format('DD/MM/YYYY')
    }
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
    <Layout
      header={
        <Header
          title={translate('private_relay.manage_subdomain.title')}
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 30 }} />
          )}
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

      {/** Enable use subdomain to generte future aliases */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 22,
      }}>
        <Text text={translate('private_relay.manage_subdomain.use_subdomain')} />
        <Switch
          value={useSubdomain}
          onValueChange={setUseSubdomain}
          onColor={color.primary}
          offColor={color.disabled}
        />
      </View>


      <Button
        style={{ marginTop: 30 }}
        text={translate('private_relay.manage_subdomain.edit_btn')}
        onPress={() => setShowEditModal(true)}
      />
    </Layout >
  )
})
