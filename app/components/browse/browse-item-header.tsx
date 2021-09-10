import * as React from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { color, commonStyles } from "../../theme"
import { Button } from "../button/button"
import { Text } from "../text/text"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { Input } from "native-base"
import { Header } from "../header/header"
import { translate } from "../../i18n"


export interface BrowseItemHeaderProps {
  openSort?: Function,
  openAdd?: Function,
  navigation: any,
  header: string,
  onSearch?: Function
}

/**
 * Describe your component here
 */
export const BrowseItemHeader = observer(function BrowseItemHeader(props: BrowseItemHeaderProps) {
  const { openAdd, openSort, navigation, header, onSearch } = props

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

        <Input
          size="xs"
          placeholder={translate('common.search')}
          onChangeText={(txt) => onSearch && onSearch(txt)}
          style={{
            backgroundColor: color.block,
            paddingBottom: 5,
            paddingTop: 5
          }}
          InputRightElement={
            <Button
              preset="link"
              style={{ paddingRight: 15, backgroundColor: color.block, height: 38 }}
            >
              <FontAwesomeIcon
                name="search"
                size={14}
                color={color.text}
              />
            </Button>
          }
        />
      </View>
    </Header>
  )
})
