import * as React from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { color, commonStyles } from "../../theme"
import { Button } from "../button/button"
import { Text } from "../text/text"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { Header } from "../header/header"
import { SearchBar } from "../search-bar/search-bar"


export interface BrowseItemHeaderProps {
  openSort?: Function,
  openAdd?: Function,
  navigation: any,
  header: string,
  onSearch?: (text: string) => void,
  searchText?: string
}

/**
 * Describe your component here
 */
export const BrowseItemHeader = observer(function BrowseItemHeader(props: BrowseItemHeaderProps) {
  const { openAdd, openSort, navigation, header, onSearch, searchText } = props

  return (
    <Header
      goBack={() => navigation.goBack()}
      right={(
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            justifyContent: 'space-between',
            maxWidth: 50
          }]}
        >
          <Button
            preset="link"
            style={{ marginRight: openAdd ? 20 : 0 }}
            onPress={() => openSort && openSort()}
          >
            <FontAwesomeIcon
              name="sliders"
              size={18}
              color={color.title}
            />
          </Button>

          {
            openAdd && (
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
            )
          }
        </View>
      )}
    >
      <View style={{ marginTop: 5 }}>
				<Text
					preset="largeHeader"
					text={header}
          style={{ marginBottom: 10 }}
				/>

        <SearchBar value={searchText} onSearch={onSearch} />
      </View>
    </Header>
  )
})
