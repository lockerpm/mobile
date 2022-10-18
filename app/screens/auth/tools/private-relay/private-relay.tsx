import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Animated, TouchableOpacity, View } from 'react-native'
import { Layout, Header, Text, AutoImage as Imgae, Button } from '../../../../components'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '../../../../theme'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import { useMixins } from '../../../../services/mixins'
import { AliasItem } from './private-relay-item'
import { useStores } from '../../../../models'
import { EditAliasModal } from './edit-alias-modal'
import { RelayAddress } from '../../../../config/types/api'
import { PlanType } from '../../../../config/types'

const FREE_PLAM_ALIAS_LIMIT = 5

export const PrivateRelay = observer(() => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  const { toolStore, user } = useStores()

  const [alias, setAlias] = useState<RelayAddress[]>([])
  const [showDesc, setShowDesc] = useState(false)
  const [showSubdomainDesc, setShowSubdomainDesc] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)


  const isFreeAccount = (user.plan?.alias === PlanType.FREE) || !user.plan
  const isReachLimit = isFreeAccount && alias.length >= FREE_PLAM_ALIAS_LIMIT
  const suffixitle = isFreeAccount ? ` (${alias.length}/5)` : ` (${alias.length})`

  const rootEmailDesc = [
    translate('private_relay.desc.one'),
    translate('private_relay.desc.two'),
    translate('private_relay.desc.three'),
  ]

  const fetchRelayListAddressed = async () => {
    const res = await toolStore.fetchRelayListAddresses()
    if (res.kind === 'ok') {
      setShowDesc(res.data.count === 0)
      setAlias(res.data.results.reverse())
    }
  }

  const generateRelayNewAddress = async () => {
    const res = await toolStore.generateRelayNewAddress()
    if (res.kind === 'ok') {
      const newList = [...alias]
      newList.unshift(res.data)
      setAlias(newList)
    }
  }

  const deleteRelayAddress = (id: number) => {
    const newList = alias.filter((a) => a.id !== id)
    setAlias(newList)
  }

  const onEdit = () => {
    fetchRelayListAddressed()
  }

  useEffect(() => {
    fetchRelayListAddressed()
  }, [])

  // Render
  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
      }}
      header={
        <Header
          title={translate('private_relay.title')}
          goBack={() => navigation.goBack()}
          right={
            <Button
              disabled={isReachLimit}
              textStyle={{
                color: isReachLimit ? color.block : color.primary,
              }}
              preset="link"
              text={translate('private_relay.btn')}
              onPress={() => {
                generateRelayNewAddress()
              }}
            />
          }
        />
      }
    >
      {alias.length > 0 && (
        <EditAliasModal
          item={alias[0]}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
          }}
          onEdit={onEdit}
        />
      )}
      {/* Root email start */}
      <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setShowDesc(!showDesc)
          }}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: color.line,
            borderRadius: 8,
            paddingTop: 12,
            paddingRight: 16,
            paddingBottom: 12,
            paddingLeft: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Imgae
                source={require('./root-email.png')}
                style={{
                  width: 36,
                  height: 36,
                }}
              />
              <View style={{ marginLeft: 8 }}>
                <Text text={translate('private_relay.root_email')} />
                <Text preset="semibold" text={user.email} />
              </View>
            </View>
            <EvilIcons name={showDesc ? 'chevron-up' : 'chevron-down'} size={24} />
          </View>

          {showDesc && (
            <Animated.View style={{ marginTop: 8 }}>
              {rootEmailDesc.map((item, index) => (
                <View
                  key={index}
                  style={{ flexDirection: 'row', marginRight: 16, marginVertical: 2 }}
                >
                  <Entypo name="dot-single" size={16} />
                  <Text text={item} />
                </View>
              ))}
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
      {/* Root email end */}

      {/* Subdomain start */}
      <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setShowSubdomainDesc(!showSubdomainDesc)
          }}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: color.line,
            borderRadius: 8,
            paddingTop: 12,
            paddingRight: 16,
            paddingBottom: 12,
            paddingLeft: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Imgae
                source={require('./root-email.png')}
                style={{
                  width: 36,
                  height: 36,
                }}
              />
              <View style={{ marginLeft: 8 }}>
                <Text text={"Your subdomain"} />
                <Text preset="semibold" text={"viktor-agency.maily.org"} />
              </View>
            </View>
            <EvilIcons name={showDesc ? 'chevron-up' : 'chevron-down'} size={24} />
          </View>

          {showSubdomainDesc && (
            <Animated.View style={{ marginTop: 8 }}>
              <View
                style={{ flexDirection: 'row', marginRight: 16, marginVertical: 2 }}
              >
                <Entypo name="dot-single" size={16} />
                <Text text={"Custom sub-domain allows you to create custom email domain"} />
              </View>
              <View
                style={{ flexDirection: 'row', marginRight: 16, marginVertical: 2 }}
              >
                <Entypo name="dot-single" size={16} />
                <Text text={"You can create one (editable) subdomain"} />
              </View>
              <Button text='Manage' style={{ marginTop: 24 }} onPress={() => navigation.navigate('manageSubdomain')} />
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
      {/* Root email end */}


      <Text
        text={translate('private_relay.label') + suffixitle}
        style={{
          marginLeft: 20,
          marginVertical: 12,
        }}
      />
      {/* emails */}
      <View
        style={[
          commonStyles.SECTION_PADDING,
          {
            backgroundColor: color.background,
          },
        ]}
      >
        {alias.map((item, index) => (
          <AliasItem
            isFreeAccount={isFreeAccount}
            navigation={navigation}
            key={index}
            index={index}
            item={item}
            deleteRelayAddress={deleteRelayAddress}
            setShowEditModal={() => setShowEditModal(true)}
          />
        ))}
      </View>
      {/* emails end */}
    </Layout>
  )
})
