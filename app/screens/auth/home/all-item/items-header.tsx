import React from "react"
import { View } from "react-native"
import { Button, Header, SearchBar } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import EntypoIcon from 'react-native-vector-icons/Entypo'

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
            justifyContent: 'space-between',
            maxWidth: 50
          }]}
        >
          <Button
            preset="link"
            style={{ marginRight: 20 }}
            onPress={() => openSort && openSort()}
          >
            <FontAwesomeIcon
              name="sliders"
              size={20}
              color={color.title}
            />
          </Button>

          <Button
            preset="link"
            onPress={() => openAdd && openAdd()}
          >
            <EntypoIcon
              name="plus"
              size={23}
              color={color.title}
            />
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
