import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from 'lodash/orderBy'
import { Text } from "../../../../../components/text/text"
// import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { AccountRole, AccountRoleText } from "../../../../../config/types"
import { Organization } from "../../../../../../core/models/domain/organization"
import { ShareItemAction } from "./share-item-action"
import { SharedMemberType } from "../../../../../services/api/api.types"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { CipherShareListItem, CipherShareType } from "./cipher-share-list-item"
import { FolderView } from "../../../../../../core/models/view/folderView"
import { CollectionView } from "../../../../../../core/models/view/collectionView"

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
  const {  translate } = useMixins()
  const { getCiphersFromCache } = useCipherDataMixins()
  const { getCipherInfo } = useCipherHelpersMixins()
  const { cipherStore, collectionStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [ciphers, setCiphers] = useState<CipherShareType[]>([])
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

      // // TODO 
      // if (collections.some(e => c.collectionIds.includes(e.id))) {
      //   return false
      // }

      const share = _getShare(c.organizationId)
      const org = _getOrg(c.organizationId)
      return org && org.type === AccountRole.OWNER && share && share.members.length
    }]

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false
    })
    let res: CipherShareType[] = []

    // Add image + share info
    searchRes.forEach((c: CipherView) => {
      const cipherInfo = getCipherInfo(c)

      // @ts-ignore
      const data: CipherShareType = {
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
  const openActionMenu = (item: CipherShareType) => {
    cipherStore.setSelectedCipher(item)
    setSelectedMember(item.member)
    setShowAction(true)
  }

  // Go to detail
  const goToDetail = (item: CipherShareType) => {
    cipherStore.setSelectedCipher(item)
    const cipherInfo = getCipherInfo(item)
    navigation.navigate(`${cipherInfo.path}__info`)
  }

  // ------------------------ RENDER ----------------------------

  const renderItem = ({ item }) => (
    <CipherShareListItem
      item={item}
      openActionMenu={openActionMenu}
    />
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
