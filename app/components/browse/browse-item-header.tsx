import * as React from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { commonStyles } from "../../theme"
import { Button } from "../button/button"
import { Text } from "../text/text"
import { Header } from "../header/header"
import { SearchBar } from "../search-bar/search-bar"

// @ts-ignore
import ConfigIcon from './config.svg'
// @ts-ignore
import ConfigIconLight from './config-light.svg'
// @ts-ignore
import PlusIcon from './plus.svg'
// @ts-ignore
import PlusIconLight from './plus-light.svg'
import { useStores } from "../../models"


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
  const { uiStore } = useStores()

  return (
    <Header
      goBack={() => navigation.goBack()}
      right={(
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            justifyContent: 'space-between'
          }]}
        >
          <Button
            preset="link"
            style={{ marginRight: openAdd ? 20 : 0 }}
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

          {
            openAdd && (
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
