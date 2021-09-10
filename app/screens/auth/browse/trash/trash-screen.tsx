import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"
import { translate } from "../../../../i18n"


export const TrashScreen = observer(function TrashScreen() {
  const navigation = useNavigation()

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sortList, setSortList] = useState({
    orderField: 'name',
    order: 'asc'
  })
  const [sortOption, setSortOption] = useState('az')

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header={translate('common.trash')}
          openSort={() => setIsSortOpen(true)}
          onSearch={setSearchText}
          searchText={searchText}
          navigation={navigation}
        />
      )}
      borderBottom
      noScroll
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

      <CipherList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        sortList={sortList}
        deleted={true}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title={translate('trash.empty.title')}
            desc={translate('trash.empty.desc')}
          />
        )}
      />
    </Layout>
  )
})
