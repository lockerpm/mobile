import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"


export const TrashScreen = observer(function TrashScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)

  return (
    <Layout
      header={(
        <BrowseItemHeader
          header="Trash"
          openSort={() => setIsSortOpen(true)}
          navigation={navigation}
        />
      )}
      borderBottom
      noScroll
    >
      <SortAction 
        isOpen={isSortOpen} 
        onClose={() => setIsSortOpen(false)}
      />

      <CipherList
        navigation={navigation}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title="Empty trash"
            desc="All items moved to Trash can be restored until you delete them permanently"
          />
        )}
      />
    </Layout>
  )
})
