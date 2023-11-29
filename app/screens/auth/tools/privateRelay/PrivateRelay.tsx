import React, { FC, useEffect, useState } from "react"
import { LayoutAnimation, TouchableOpacity, View } from "react-native"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { RelayAddress, SubdomainData } from "app/static/types"
import { Screen, Header, Text, Button, ImageIcon, Icon } from "app/components/cores"
import { AliasItem } from "./PrivateRelayItem"
import { EditAliasModal } from "./EditAliasModal"
import { CreateSubdomainModal } from "./manageSubdomain/CreateSubdomainModal"
import { ConfigAliasModal } from "./ConfigAliasModal"
import Animated, { FadeInUp } from "react-native-reanimated"
import { observer } from "mobx-react-lite"
import { useHelper } from "app/services/hook"
import { ToolsStackScreenProps } from "app/navigators/navigators.types"

const FREE_PLAM_ALIAS_LIMIT = 5

export const PrivateRelay: FC<ToolsStackScreenProps<"privateRelay">> = observer((props) => {
  const navigation = props.navigation
  const { colors } = useTheme()
  const { toolStore, user } = useStores()
  const { translate } = useHelper()

  const [alias, setAlias] = useState<RelayAddress[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RelayAddress>(null)

  // subdomain
  const [showCreateSubdomainModal, setShowCreateSubdomainModal] = useState(false)
  const [subdomain, setSubdomain] = useState<SubdomainData>(null)

  const isFreeAccount = user.isFreePlan
  const isReachLimit = isFreeAccount && alias.length >= FREE_PLAM_ALIAS_LIMIT
  const suffixitle = isFreeAccount ? ` (${alias.length}/5)` : ` (${alias.length})`

  const fetchRelayDomain = async () => {
    const res = await toolStore.fetchSubdomain()
    if (res.kind === "ok") {
      if (res.data.length === 0) {
        setSubdomain(null)
      } else {
        setSubdomain(res.data[0])
      }
    }
  }

  const fetchRelayListAddressed = async () => {
    const res = await toolStore.fetchRelayListAddresses()
    if (res.kind === "ok") {
      setAlias(res.data.results)
    }
  }

  const generateRelayNewAddress = async () => {
    const res = await toolStore.generateRelayNewAddress()
    if (res.kind === "ok") {
      const newList = [...alias, res.data]
      setAlias(newList)
      fetchRelayDomain()
    }
  }

  const deleteRelayAddress = (id: number) => {
    const newList = alias.filter((a) => a.id !== id)
    setAlias(newList)
  }

  const onMount = () => {
    fetchRelayListAddressed()
    fetchRelayDomain()
  }

  useEffect(() => {
    fetchRelayListAddressed()
  }, [selectedItem])

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", onMount)
    return unsubscribe
  }, [])

  // Render
  return (
    <Screen
      safeAreaEdges={["bottom"]}
      preset="auto"
      header={
        <Header
          title={translate("private_relay.title")}
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          titleMode="center"
          RightActionComponent={
            <TouchableOpacity
              disabled={isReachLimit}
              onPress={() => {
                generateRelayNewAddress()
              }}
            >
              <Text
                text={translate("private_relay.btn")}
                color={isReachLimit ? colors.block : colors.primary}
              />
            </TouchableOpacity>
          }
        />
      }
    >
      <CreateSubdomainModal
        isOpen={showCreateSubdomainModal}
        onClose={() => setShowCreateSubdomainModal(false)}
        setSubdomain={setSubdomain}
      />

      {alias.length > 0 && (
        <>
          {!!selectedItem && (
            <ConfigAliasModal
              item={selectedItem}
              isOpen={showConfigModal}
              onClose={() => {
                setShowConfigModal(false)
                setSelectedItem(null)
              }}
            />
          )}
          <EditAliasModal
            item={alias[0]}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
            }}
            onEdit={fetchRelayListAddressed}
          />
        </>
      )}

      <Item isFreeAccount={isFreeAccount} isRootEmail email={user.email} />

      {!isFreeAccount && (
        <Item
          isFreeAccount={isFreeAccount}
          isRootEmail={false}
          subdomain={subdomain}
          createSubdomain={() => setShowCreateSubdomainModal(true)}
          manageSubdomain={() => navigation.navigate("manageSubdomain", { subdomain })}
        />
      )}

      {/* emails */}
      <View
        style={{
          paddingHorizontal: 20,
          backgroundColor: colors.background,
        }}
      >
        <Text
          preset="label"
          text={translate("private_relay.label") + suffixitle}
          style={{
            marginVertical: 12,
          }}
        />
        {alias.map((item, index) => (
          <AliasItem
            isFreeAccount={isFreeAccount}
            key={index}
            index={index}
            item={item}
            deleteRelayAddress={deleteRelayAddress}
            setShowEditModal={() => setShowEditModal(true)}
            navigateStatistic={() => {
              navigation.navigate("aliasStatistic", { alias: item })
            }}
            setShowConfigModal={() => {
              setShowConfigModal(true)
              setSelectedItem(item)
            }}
          />
        ))}
      </View>
    </Screen>
  )
})

interface ItemProps {
  isFreeAccount: boolean
  isRootEmail: boolean
  email?: string
  subdomain?: SubdomainData
  manageSubdomain?: () => void
  createSubdomain?: () => void
}

const Item = ({
  isFreeAccount,
  isRootEmail,
  email,
  subdomain,
  manageSubdomain,
  createSubdomain,
}: ItemProps) => {
  const { colors } = useTheme()
  const [showDesc, setShowDesc] = useState(false)

  const { translate } = useHelper()

  const rootEmailDesc = isFreeAccount
    ? [
        translate("private_relay.desc.one"),
        translate("private_relay.desc.two"),
        translate("private_relay.desc.three"),
      ]
    : [
        translate("private_relay.desc_premium.one"),
        translate("private_relay.desc_premium.two"),
        translate("private_relay.desc_premium.three"),
      ]

  const subDomainDesc = [
    translate("private_relay.manage_subdomain.desc.one"),
    translate("private_relay.manage_subdomain.desc.two"),
  ]
  const descriptions = isRootEmail ? rootEmailDesc : subDomainDesc
  const title = isRootEmail ? email : subdomain ? `${subdomain.subdomain}.maily.org` : ""
  return (
    <TouchableOpacity
      onPress={() => {
        LayoutAnimation.configureNext({
          duration: 250,
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
          },
        })
        setShowDesc(!showDesc)
      }}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginHorizontal: 20,
          marginVertical: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", maxWidth: "80%" }}>
            <ImageIcon icon={"root-email"} size={36} />
            <View style={{ marginLeft: 8 }}>
              <Text
                text={
                  isRootEmail
                    ? translate("private_relay.root_email")
                    : subdomain
                    ? translate("private_relay.manage_subdomain.your_subdomain")
                    : translate("private_relay.no_subdomain")
                }
              />
              {!!title && <Text preset="bold" text={title + "asdasdasdasdasd"} />}
            </View>
          </View>
          <Icon icon={showDesc ? "caret-up" : "caret-down"} size={20} />
        </View>

        {showDesc && (
          <Animated.View style={{ marginTop: 8 }} entering={FadeInUp}>
            {descriptions.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  marginRight: 16,
                  marginVertical: 2,
                  alignItems: "center",
                }}
              >
                <Icon icon="dot" size={24} />
                <Text text={item} />
              </View>
            ))}

            {!!subdomain && (
              <Button
                text={translate("private_relay.manage_subdomain.manage")}
                style={{ marginTop: 24 }}
                onPress={manageSubdomain}
              />
            )}
            {!subdomain && !isRootEmail && (
              <Button
                text={translate("common.create")}
                style={{ marginTop: 24 }}
                onPress={createSubdomain}
              />
            )}
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  )
}
