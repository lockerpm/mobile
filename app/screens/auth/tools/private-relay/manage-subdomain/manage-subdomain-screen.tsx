import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Animated, TouchableOpacity, View } from 'react-native'
import { Layout, Header, Text, AutoImage as Imgae, Button, Modal, Divider } from '../../../../../components'
import { useNavigation } from '@react-navigation/native'
import { useMixins } from '../../../../../services/mixins'
import { commonStyles } from '../../../../../theme'
import { Switch } from 'react-native-ui-lib'
import { EditSubdomainModal } from './edit-subdomain-modal'

export const ManageSubdomainScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()


  const [showEditModal, setShowEditModal] = useState(false)
  const [subdomain, setSubdomain] = useState("asd")
  const [numberAlias, setNumberAlias] = useState("asd")
  const [blockEmails, setBlockEmails] = useState("asd")
  const [forwardEmails, setForwardEmails] = useState("asd")
  const [createDate, setCreateDate] = useState("asd")
  const [enableSubdomain, setEnableSubdomain] = useState(false)

  const mounted = async () => {
    //
  }

  const data = [
    {
      label: translate('private_relay.manage_subdomain.your_subdomain'),
      data: subdomain
    },
    {
      label:translate('private_relay.manage_subdomain.num_alias'),
      data: numberAlias
    },
    {
      label:translate('private_relay.manage_subdomain.block_email'),
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
          value={enableSubdomain}
          onValueChange={setEnableSubdomain}
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
