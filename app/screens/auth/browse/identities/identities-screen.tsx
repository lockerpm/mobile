import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"
import { CipherType } from "../../../../../core/enums"
import { useMixins } from "../../../../services/mixins"


export const IdentitiesScreen = observer(function IdentitiesScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()

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
          header={translate('common.identity')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('identities__edit', { mode: 'add' })
          }}
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
        cipherType={CipherType.Identity}
        sortList={sortList}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title={translate('identity.empty.title')}
            desc={translate('identity.empty.desc')}
            buttonText={translate('identity.empty.btn')}
            addItem={() => {
              navigation.navigate('identities__edit', { mode: 'add' })
            }}
          />
        )}
      />
    </Layout>
  )
})
