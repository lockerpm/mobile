import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { BrowseItemEmptyContent, BrowseItemHeader, Layout } from "../../../../../components"
import { SortAction } from "../../../home/all-item/sort-action"
import { CipherShareList } from "./cipher-share-list"
import { PlanType } from "../../../../../config/types"
import { PushNotifier } from "../../../../../utils/push-notification"


export const ShareItemsScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, goPremium } = useMixins()
  const { user } = useStores()

  // --------------------- PARAMS -------------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc'
  })
  const [sortOption, setSortOption] = useState('last_updated')

  // --------------------- COMPUTED -------------------------

  const isFreeAccount = (user.plan?.alias === PlanType.FREE) || !user.plan

  // --------------------- EFFECTS -------------------------

  // Clear noti
  useEffect(() => {
    PushNotifier.cancelNotification('share_confirm')
  }, [navigation])

  // --------------------- RENDER -------------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header={translate('shares.share_items')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            if (isFreeAccount) {
              goPremium()
            } else {
              navigation.navigate('shareMultiple')
            }
          }}
          onSearch={setSearchText}
          searchText={searchText}
          navigation={navigation}
          isSelecting={false}
          setIsSelecting={() => {}}
          selectedItems={[]}
          setSelectedItems={() => {}}
          setIsLoading={setIsLoading}
          toggleSelectAll={() => {}}
        />
      )}
      borderBottom
      noScroll
      hasBottomNav
    >
      <SortAction
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string, order: string }) => {
          setSortOption(value)
          setSortList(obj)
        }}
        value={sortOption}
      />

      <CipherShareList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        sortList={sortList}
        emptyContent={isFreeAccount ? (
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 55 }}
            title={translate('shares.empty.title')}
            desc={translate('error.not_available_for_free')}
            buttonText={translate('common.upgrade')}
            addItem={goPremium}
          />
        ) : (
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 55 }}
            title={translate('shares.empty.title')}
            desc={translate('shares.empty.desc_share')}
            buttonText={translate('shares.start_sharing')}
            addItem={() => navigation.navigate('shareMultiple')}
          />
        )}
      />
    </Layout>
  )
})