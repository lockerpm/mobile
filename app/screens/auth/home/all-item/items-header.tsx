import React from "react"
import { View } from "react-native"
import { Button, Header, SearchBar } from "../../../../components"
import { commonStyles } from "../../../../theme"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"

// @ts-ignore
import ConfigIcon from './config.svg'
// @ts-ignore
import ConfigIconLight from './config-light.svg'
// @ts-ignore
import PlusIcon from './plus.svg'
// @ts-ignore
import PlusIconLight from './plus-light.svg'


interface Props {
  openSort?: Function,
  openAdd?: Function,
  onSearch?: (text: string) => void
  searchText?: string
}

export const ItemsHeader = observer((props: Props) => {
  const { openAdd, openSort, onSearch, searchText } = props
  const { uiStore } = useStores()

  return (
    <Header
      showLogo
      right={(
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            justifyContent: 'space-between'
          }]}
        >
          <Button
            preset="link"
            style={{ marginRight: 20 }}
            onPress={() => openSort && openSort()}
          >
            {
              uiStore.isDark ? (
                <ConfigIconLight height={17} />
              ) : (
                <ConfigIcon height={17} />
              )
            }
          </Button>

          <Button
            preset="link"
            onPress={() => openAdd && openAdd()}
          >
            {
              uiStore.isDark ? (
                <PlusIconLight height={18} />
              ) : (
                <PlusIcon height={18} />
              )
            }
          </Button>
        </View>
      )}
    >
      <SearchBar
        style={{ marginTop: 15 }}
        onSearch={onSearch}
        value={searchText}
      />
    </Header>
  )
})
