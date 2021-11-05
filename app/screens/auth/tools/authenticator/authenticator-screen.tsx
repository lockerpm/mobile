import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/core"
import { useMixins } from "../../../../services/mixins"
import { Layout, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { SortAction } from "../../home/all-item/sort-action"
import { AuthenticatorAddAction } from "./authenticator-add-action"
import { OtpList } from "./otp-list"


export const AuthenticatorScreen = observer(function AuthenticatorScreen() {
  const { translate } = useMixins()
  const navigation = useNavigation()

  // -------------------- PARAMS ----------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'name',
    order: 'asc'
  })
  const [sortOption, setSortOption] = useState('az')
  const [isLoading, setIsLoading] = useState(false)


  // -------------------- RENDER ----------------------

  return (
    <Layout
      noScroll
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header={translate('authenticator.title')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          navigation={navigation}
          searchText={searchText}
          onSearch={setSearchText}
        />
      )}
    >
      {/* Actions */}
      <SortAction
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string, order: string }) => {
          setSortOption(value)
          setSortList(obj)
        }}
        value={sortOption}
      />

      <AuthenticatorAddAction 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
      />
      {/* Actions end */}

      {/* OTP list */}
      <OtpList
        searchText={searchText}
        sortList={sortList}
        onLoadingChange={setIsLoading}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 120 }}
            title={translate('authenticator.empty.title')}
            desc={translate('authenticator.empty.desc')}
            buttonText={translate('authenticator.empty.btn')}
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        )}
      />
      {/* OTP list end */}
    </Layout>
  )
})
