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
import { RelayAddress, SubdomainData } from '../../../../config/types/api'
import { PlanType } from '../../../../config/types'
import { CreateSubdomainModal } from './manage-subdomain/create-subdomain-modal'
import { ConfigAliasModal } from './config-alias-modal'

const FREE_PLAM_ALIAS_LIMIT = 5

export const PrivateRelay = observer(() => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  const { toolStore, user } = useStores()

  const [alias, setAlias] = useState<RelayAddress[]>([])
  const [showDesc, setShowDesc] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RelayAddress>(null)

  // subdomain
  const [showCreateSubdomainModal, setShowCreateSubdomainModal] = useState(false)
  const [showSubdomainDesc, setShowSubdomainDesc] = useState(false)
  const [subdomain, setSubdomain] = useState<SubdomainData>(null)

  const isFreeAccount = (user.plan?.alias === PlanType.FREE) || !user.plan
  const isReachLimit = isFreeAccount && alias.length >= FREE_PLAM_ALIAS_LIMIT
  const suffixitle = isFreeAccount ? ` (${alias.length}/5)` : ` (${alias.length})`

  const rootEmailDesc = [
    translate('private_relay.desc.one'),
    translate('private_relay.desc.two'),
    translate('private_relay.desc.three'),
  ]

  const fetchRelayDomain = async () => {
    const res = await toolStore.fetchSubdomain()
    if (res.kind === 'ok') {
      if (res.data.length === 0) {
        setSubdomain(null)
      }
      else {
        setSubdomain(res.data[0])
      }
    }
  }

  const fetchRelayListAddressed = async () => {
    const res = await toolStore.fetchRelayListAddresses()
    if (res.kind === 'ok') {
      setShowDesc(res.data.count === 0)
      setAlias(res.data.results)
    }
  }

  const generateRelayNewAddress = async () => {
    const res = await toolStore.generateRelayNewAddress()
    if (res.kind === 'ok') {
      const newList = [...alias, res.data]
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
  }, [selectedItem])

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchRelayDomain)
    return unsubscribe
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
      <CreateSubdomainModal
        isOpen={showCreateSubdomainModal}
        onClose={() => setShowCreateSubdomainModal(false)}
        setSubdomain={setSubdomain}
      />

      {alias.length > 0 && (<>
        {!!selectedItem && <ConfigAliasModal
          item={selectedItem}
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false)
            setSelectedItem(null)
          }}
        />}
        <EditAliasModal
          item={alias[0]}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
          }}
          onEdit={onEdit}
        />
      </>
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
      {!isFreeAccount && <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}>
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
              <View style={{ marginLeft: 8, justifyContent: "center" }}>
                {
                  !subdomain && (<>
                    <Text text={"Ban chưa có subdomain"} />
                  </>)
                }
                {
                  subdomain !== null && (<>
                    <Text text={translate('private_relay.manage_subdomain.your_subdomain')} />
                    <Text preset="semibold" text={subdomain.subdomain} />
                  </>)
                }
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
                <Text text={translate('private_relay.manage_subdomain.desc.one')} />
              </View>
              <View
                style={{ flexDirection: 'row', marginRight: 16, marginVertical: 2 }}
              >
                <Entypo name="dot-single" size={16} />
                <Text text={translate('private_relay.manage_subdomain.desc.two')} />
              </View>
              {
                subdomain !== null && <Button
                  text={translate('private_relay.manage_subdomain.manage')}
                  style={{ marginTop: 24 }}
                  onPress={() => navigation.navigate('manageSubdomain', { subdomain })} />
              }
              {
                !subdomain && <Button
                  text={translate('common.create')}
                  style={{ marginTop: 24 }}
                  onPress={() => setShowCreateSubdomainModal(true)} />
              }
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>}
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
            setShowConfigModal={() => {
              setShowConfigModal(true)
              setSelectedItem(item)
            }}
          />
        ))}
      </View>
      {/* emails end */}
    </Layout>
  )
})
