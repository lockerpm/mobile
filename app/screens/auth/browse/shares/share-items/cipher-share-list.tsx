import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from 'lodash/orderBy'
import { Button } from "../../../../../components/button/button"
import { Text } from "../../../../../components/text/text"
import { AutoImage as Image } from "../../../../../components/auto-image/auto-image"
// import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { commonStyles, fontSize } from "../../../../../theme"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { AccountRole, AccountRoleText, SharingStatus } from "../../../../../config/types"
import { Organization } from "../../../../../../core/models/domain/organization"
import { ShareItemAction } from "./share-item-action"
import { SharedMemberType } from "../../../../../services/api/api.types"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"


type Props = {
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: Function
  sortList?: {
    orderField: string
    order: string
  }
}

/**
 * Describe your component here
 */
export const CipherShareList = observer((props: Props) => {
  const {
    emptyContent, navigation, onLoadingChange, searchText, sortList
  } = props
  const { translate, color } = useMixins()
  const { getCiphers } = useCipherDataMixins()
  const { getCipherInfo } = useCipherHelpersMixins()
  const { cipherStore } = useStores()
  type ListItem = CipherView & {
    logo?: any
    imgLogo?: any
    svg?: any
    notSync?: boolean
    description?: string
    status?: string
    member?: SharedMemberType
  }

  // ------------------------ PARAMS ----------------------------

  const [ciphers, setCiphers] = useState<ListItem[]>([])
  const [showAction, setShowAction] = useState(false)
  const [selectedMember, setSelectedMember] = useState<SharedMemberType>(null)

  // ------------------------ COMPUTED ----------------------------
 
  const organizations = cipherStore.organizations
  const allCiphers = ciphers
  const myShares = cipherStore.myShares

  // ------------------------ EFFECTS ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, sortList, JSON.stringify(cipherStore.myShares)])

  // ------------------------ METHODS ----------------------------

  const _getOrg = (id: string) => {
    return organizations.find((o: Organization) => o.id === id)
  }

  const _getShare = (id: string) => {
    return myShares.find(s => s.id === id)
  }

  // Get ciphers list
  const loadData = async () => {
    // onLoadingChange && onLoadingChange(true)
    
    // Filter
    const filters = [(c: CipherView) => {
      if (!c.organizationId) {
        return false
      }
      const share = _getShare(c.organizationId)
      const org = _getOrg(c.organizationId)
      return org && org.type === AccountRole.OWNER && share && share.members.length
    }]

    // Search
    const searchRes = await getCiphers({
      filters,
      searchText,
      deleted: false
    })
    let res: ListItem[] = []

    // Add image + share info
    searchRes.forEach((c: CipherView) => {
      const cipherInfo = getCipherInfo(c)

      // @ts-ignore
      const data: ListItem = {
        ...c,
        logo: cipherInfo.backup,
        imgLogo: cipherInfo.img,
        svg: cipherInfo.svg,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(c.id),
        description: '',
        status: null
      }

      // Display for each sharing member
      const share = _getShare(c.organizationId)
      share.members.forEach(m => {
        let shareType = ''
        switch (m.role) {
          case AccountRoleText.MEMBER:
            shareType = !m.hide_passwords ? translate('shares.share_type.view') : translate('shares.share_type.only_fill')
            break
          case AccountRoleText.ADMIN:
            shareType = translate('shares.share_type.edit')
            break
        }

        data.description = `${translate('shares.shared_with')} ${m.full_name} - ${shareType}`
        data.status = m.status
        data.member = m

        // @ts-ignore
        res.push({ ...data })
      })
    })

    // Sort
    if (sortList) {
      const { orderField, order } = sortList
      res = orderBy(
        res,
        [c => orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate],
        [order]
      ) || []
    }

    // Delay loading
    setTimeout(() => {
      onLoadingChange && onLoadingChange(false)
    }, 100)

    // Done
    setCiphers(res)
  }

  // Handle action menu open
  const openActionMenu = (item: ListItem) => {
    cipherStore.setSelectedCipher(item)
    setSelectedMember(item.member)
    setShowAction(true)
  }

  // Go to detail
  const goToDetail = (item: ListItem) => {
    cipherStore.setSelectedCipher(item)
    const cipherInfo = getCipherInfo(item)
    navigation.navigate(`${cipherInfo.path}__info`)
  }

  // Get cipher description
  const getDescription = (item: ListItem) => {
    return item.description
  }

  // ------------------------ RENDER ----------------------------

  const renderItem = ({ item }) => (
    <Button
      preset="link"
      onPress={() => {
        // goToDetail(item)
        openActionMenu(item)
      }}
      style={{
        borderBottomColor: color.line,
        borderBottomWidth: 0.5,
        paddingVertical: 15,
        height: 70.5
      }}
    >
      <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
        {/* Cipher avatar */}
        {
          item.svg ? (
            <item.svg height={40} width={40} />
          ) : (
            <Image
              source={item.imgLogo || item.logo}
              backupSource={item.logo}
              style={{
                height: 40,
                width: 40,
                borderRadius: 8
              }}
            />
          )
        }
        {/* Cipher avatar end */}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
            <View style={{ flex: 1 }}>
              <Text
                preset="semibold"
                text={item.name}
                numberOfLines={1}
                style={{
                  marginRight: item.status ? 10 : 0
                }}
              />
            </View>

            {/* Sharing status */}
            {
              item.status && (
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical: 2,
                  backgroundColor: item.status === SharingStatus.INVITED 
                    ? color.warning
                    : item.status === SharingStatus.ACCEPTED
                      ? color.info
                      : color.primary,
                  borderRadius: 3,
                }}>
                  <Text
                    text={item.status.toUpperCase()}
                    style={{
                      fontWeight: 'bold',
                      color: color.background,
                      fontSize: fontSize.mini
                    }}
                  />
                </View>
              )
            }
            {/* Sharing status */}

            {/* Not sync icon */}
            {
              item.notSync && (
                <View style={{ marginLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="cloud-off-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )
            }
            {/* Not sync icon end */}
          </View>

          {/* Description */}
          {
            !!getDescription(item) && (
              <Text
                text={getDescription(item)}
                style={{ fontSize: fontSize.small }}
                numberOfLines={1}
              />
            )
          }
          {/* Description end */}
        </View>

        {/* <Button
          preset="link"
          onPress={() => openActionMenu(item)}
          style={{ 
            height: 40,
            width: 40,
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          <IoniconsIcon
            name="ellipsis-horizontal"
            size={18}
            color={color.textBlack}
          />
        </Button> */}
      </View>
    </Button>
  )

  return allCiphers.length ? (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

      <ShareItemAction
        isOpen={showAction}
        onClose={() => setShowAction(false)}
        onLoadingChange={onLoadingChange}
        member={selectedMember}
        goToDetail={goToDetail}
      />

      {/* Action menus end */}

      {/* Cipher list */}
      <FlatList
        style={{ 
          paddingHorizontal: 20, 
        }}
        data={allCiphers}
        keyExtractor={(item, index) => item.id.toString() + index.toString()}
        renderItem={renderItem}
        getItemLayout={(data, index) => ({
          length: 71,
          offset: 71 * index,
          index
        })}
      />
      {/* Cipher list end */}
    </View>
  ) : (
    emptyContent && !searchText.trim() ? (
      <View style={{ paddingHorizontal: 20 }}>
        {emptyContent}
      </View>
    ) : (
      <View style={{ paddingHorizontal: 20 }}>
        <Text
          text={translate('error.no_results_found') + ` '${searchText}'`}
          style={{
            textAlign: 'center'
          }}
        />
      </View>
    )
  )
})
