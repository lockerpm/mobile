import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"
import { CipherType } from "../../../../../core/enums"
import { useMixins } from "../../../../services/mixins"


export const PasswordsScreen = observer(function PasswordsScreen() {
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
          header={translate('common.password')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('passwords__edit', { mode: 'add' })
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
        cipherType={CipherType.Login}
        sortList={sortList}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 120 }}
            title={translate('password.empty.title')}
            desc={translate('password.empty.desc')}
            buttonText={translate('password.empty.btn')}
            addItem={() => {
              navigation.navigate('passwords__edit', { mode: 'add' })
            }}
          />
        )}
      />
    </Layout>
  )
})
