import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { TouchableOpacity, View } from "react-native"
import { Layout, Header, Text, AutoImage as Imgae, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../theme"
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import { useMixins } from "../../../../services/mixins"
import { AliasItem } from "./private-relay-item"
import { useStores } from "../../../../models"
import { RelayAddress } from "../../../../services/api"
import { EditAliasModal } from "./edit-alias-modal"


export const PrivateRelay = observer(() => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  const { toolStore, user } = useStores()

  const [alias, setAlias] = useState<RelayAddress[]>([])
  const [showDesc, setShowDesc] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const rootEmailDesc = [
    translate('private_relay.desc.one'),
    translate('private_relay.desc.two'),
    translate('private_relay.desc.three'),
  ]

  const fetchRelayListAddressed = async () => {
    const res = await toolStore.fetchRelayListAddresses()
    if (res.kind === "ok") {
      setShowDesc(res.data.count === 0)
      setAlias(res.data.results)
    }
  }

  const generateRelayNewAddress = async () => {
    const res = await toolStore.generateRelayNewAddress()
    if (res.kind === "ok") {
      const newList = [...alias]
      newList.push(res.data)
      setAlias(newList)
    }
  }

  const deleteRelayAddress = (id: number) => {
    const newList = alias.filter(a => a.id !== id)
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
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={translate('private_relay.title')}
          goBack={() => navigation.goBack()}
          right={(
            <Button
              disabled={alias.length >= 5}
              textStyle={{
                color: alias.length >= 5 ? color.block : color.primary
              }}
              preset="link"
              text={translate('common.add')}
              onPress={() => {
                generateRelayNewAddress()
              }}

            />
          )}
        />
      )}
    >
      {
        alias.length > 0 && <EditAliasModal
          item={alias[0]}
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false) }}
          onEdit={onEdit}
        />
      }
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
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <View style={{ flexDirection: "row" }}>
              <Imgae source={require('./root-email.png')} style={{
                width: 36,
                height: 36
              }} />
              <View style={{ marginLeft: 8 }}>
                <Text text={translate('private_relay.root_email')} />
                <Text preset="semibold" text={user.email} />
              </View>
            </View>
            <EvilIcons name={showDesc ? "chevron-up" : "chevron-down"} size={24} />
          </View>

          {
            showDesc && <View style={{ marginTop: 8 }}>
              {
                rootEmailDesc.map((item, index) => (
                  <View key={index} style={{ flexDirection: "row", marginRight: 16, marginVertical: 2 }}>
                    <Entypo name="dot-single" size={16} />
                    <Text text={item} />
                  </View>
                ))
              }
            </View>
          }
        </TouchableOpacity>
      </View>
      {/* Root email end */}


      {/* emails */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          marginTop: 10,
          backgroundColor: color.background
        }]}
      >
        {
          alias.map((item, index) => (
            <AliasItem
              key={index}
              index={index}
              item={item}
              deleteRelayAddress={deleteRelayAddress}
              setShowEditModal={() => setShowEditModal(true)}
            />
          ))
        }
      </View>
      {/* emails end */}
    </Layout >
  )
})
