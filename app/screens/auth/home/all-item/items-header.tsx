import React from "react"
import { View } from "react-native"
import { Button, Header, SearchBar } from "../../../../components"
import { commonStyles } from "../../../../theme"

// @ts-ignore
import ConfigIcon from './config.svg'
// @ts-ignore
import PlusIcon from './plus.svg'


interface Props {
  openSort?: Function,
  openAdd?: Function,
  onSearch?: (text: string) => void
  searchText?: string
}

export const ItemsHeader = (props: Props) => {
  const { openAdd, openSort, onSearch, searchText } = props

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
            <ConfigIcon height={17} />
          </Button>

          <Button
            preset="link"
            onPress={() => openAdd && openAdd()}
          >
            <PlusIcon height={18} />
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
}
