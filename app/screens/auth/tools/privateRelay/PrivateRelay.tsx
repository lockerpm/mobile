import React, { FC, useEffect, useRef, useState } from "react"
import { SectionList, TouchableOpacity } from "react-native"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { RelayAddress, SubdomainData } from "app/static/types"
import { Screen, Header, Text } from "app/components/cores"
import { AliasItem } from "./PrivateRelayItem"
import { EditAliasModal } from "./EditAliasModal"
import { CreateSubdomainModal } from "./manageSubdomain/CreateSubdomainModal"
import { ConfigAliasModal } from "./ConfigAliasModal"
import { observer } from "mobx-react-lite"
import { useHelper } from "app/services/hook"
import { ToolsStackScreenProps } from "app/navigators/navigators.types"
import { ConfigItem } from "./ConfigItem"

const FREE_PLAM_ALIAS_LIMIT = 5

export const PrivateRelay: FC<ToolsStackScreenProps<"privateRelay">> = observer((props) => {
  const navigation = props.navigation
  const { colors } = useTheme()
  const { toolStore, user } = useStores()
  const { translate } = useHelper()

  const pageAlias = useRef<RelayAddress[]>([])

  const [alias, setAlias] = useState<RelayAddress[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RelayAddress>(null)

  // subdomain
  const [showCreateSubdomainModal, setShowCreateSubdomainModal] = useState(false)
  const [subdomain, setSubdomain] = useState<SubdomainData>(null)

  const isFreeAccount = user.isFreePlan
  const isReachLimit = isFreeAccount && alias.length >= FREE_PLAM_ALIAS_LIMIT

  const fetchRelayDomain = async () => {
    const res = await toolStore.fetchSubdomain()
    if (res.kind === "ok") {
      if (res.data.results.length === 0) {
        setSubdomain(null)
      } else {
        setSubdomain(res.data.results[0])
      }
    }
  }

  const fetchRelayListAddressed = async () => {
    const pageNumber = pageAlias.current.length / 10 + 1

    const res = await toolStore.fetchRelayListAddresses(pageNumber)
    if (res.kind === "ok") {
      pageAlias.current = [...pageAlias.current, ...res.data.results]

      if (res.data.count > pageAlias.current.length) {
        fetchRelayListAddressed()
      } else {
        setAlias(pageAlias.current)
      }
    }
  }

  const generateRelayNewAddress = async () => {
    const res = await toolStore.generateRelayNewAddress()
    if (res.kind === "ok") {
      const newList = [...alias, res.data]
      setAlias(newList)
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

  // useEffect(() => {
  //   fetchRelayListAddressed()
  // }, [selectedItem])

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", onMount)
    return unsubscribe
  }, [])

  const ramdomEmailAlias = alias.slice(1).reverse() || []
  const suffixitle = isFreeAccount
    ? ` (${ramdomEmailAlias.length}/4)`
    : ` (${ramdomEmailAlias.length})`
  const data = [
    {
      title: "Edited email alias",
      data: [alias[0]],
      edited: true,
    },
    {
      title: `Random email alias ${suffixitle}`,
      data: ramdomEmailAlias,
      edited: false,
    },
  ]

  // Render
  return (
    <Screen
      safeAreaEdges={["bottom"]}
      preset="fixed"
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
      contentContainerStyle={{
        flex: 1,
      }}
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
            onEdit={(full_address: string) => {
              const temp = alias[0]
              temp.full_address = full_address
              temp.created_time = Date.now()
              setAlias([temp, ...alias.slice(1)])
              // fetchRelayListAddressed()
            }}
          />
        </>
      )}

      <ConfigItem isFreeAccount={isFreeAccount} isRootEmail email={user.email} />

      {!isFreeAccount && (
        <ConfigItem
          isFreeAccount={isFreeAccount}
          isRootEmail={false}
          subdomain={subdomain}
          createSubdomain={() => setShowCreateSubdomainModal(true)}
          manageSubdomain={() => navigation.navigate("manageSubdomain", { subdomain })}
        />
      )}

      {alias.length > 0 && (
        <SectionList
          stickySectionHeadersEnabled={false}
          sections={data}
          contentContainerStyle={{
            paddingHorizontal: 20,
            backgroundColor: colors.background,
          }}
          keyExtractor={(item) => item.address}
          renderItem={({ item, section }) => (
            <AliasItem
              isFreeAccount={isFreeAccount}
              isEdited={section.edited}
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
          )}
          renderSectionHeader={({ section: { title } }) => <Text preset="label">{title}</Text>}
        />
      )}
    </Screen>
  )
})
