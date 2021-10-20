import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { CipherList, Layout, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { ItemsHeader } from "./items-header"
import { SortAction } from "./sort-action"
import { AddAction } from "./add-action"
import { useMixins } from "../../../../services/mixins"
import { Alert } from "react-native"


export const AllItemScreen = observer(function AllItemScreen() {
  const navigation = useNavigation()
  const { translate, lock } = useMixins()

  // -------------- PARAMS ------------------

  const [isLoading, setIsLoading] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'name',
    order: 'asc'
  })
  const [sortOption, setSortOption] = useState('az')

  // -------------- EFFECT ------------------

  useEffect(() => {
    const handleBack = (e) => {
      if (!['POP', 'GO_BACK'].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()

      Alert.alert(
        translate('alert.lock_app'),
        '',
        [
          { 
            text: translate('common.cancel'), 
            style: 'cancel', 
            onPress: () => {}
          },
          {
            text: translate('common.lock'),
            style: 'destructive',
            onPress: async () => {
              await lock()
              navigation.navigate('lock')
            }
          },
        ]
      )
    }

    navigation.addListener('beforeRemove', handleBack)

    return () => {
      navigation.removeListener('beforeRemove', handleBack)
    }
  }, [navigation])

  // -------------- RENDER ------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <ItemsHeader
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          onSearch={setSearchText}
          searchText={searchText}
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

      <AddAction
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
      />

      <CipherList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        sortList={sortList}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 120 }}
            title={translate('all_items.empty.title')}
            desc={translate('all_items.empty.desc')}
            buttonText={translate('all_items.empty.btn')}
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        )}
      />
    </Layout>
  )
})
