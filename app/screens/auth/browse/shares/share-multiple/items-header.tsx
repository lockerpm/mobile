import React, { useState } from "react"
import { View, ViewStyle } from "react-native"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../../services/mixins"
import { commonStyles, fontSize } from "../../../../../theme"
import { Button, Header, SearchBar, Text } from "../../../../../components"
import { ShareModal } from "../../../../../components/cipher/cipher-action/share-modal"

// @ts-ignore
import ConfigIcon from './config.svg'
// @ts-ignore
import ConfigIconLight from './config-light.svg'
// @ts-ignore
import PlusIcon from './plus.svg'
// @ts-ignore
import PlusIconLight from './plus-light.svg'


interface Props {
  openSort: Function,
  openAdd: Function,
  onSearch: (text: string) => void
  searchText: string
  selectedItems: string[]
  setSelectedItems: Function
  toggleSelectAll: Function
  navigation: any
}

const BUTTON_LEFT: ViewStyle = {
  height: 35,
  width: 35,
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingLeft: 8
}

const BUTTON_RIGHT: ViewStyle = {
  height: 35,
  width: 35,
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingRight: 8
}

export const ShareMultipleHeader = observer((props: Props) => {
  const { 
    openAdd, openSort, onSearch, searchText, navigation,
    selectedItems, setSelectedItems, toggleSelectAll
  } = props
  const { translate, color, isDark } = useMixins()

  // ----------------------- PARAMS ------------------------

  const [showShareModal, setShowShareModal] = useState(false)

  // ----------------------- COMPUTED ------------------------
  
  
  // ----------------------- METHODS ------------------------

  // Select right
  const renderHeaderSelectRight = () => (
    <View
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between',
        marginRight: -8
      }]}
    >
      <Button
        preset="link"
        style={BUTTON_RIGHT}
        onPress={() => toggleSelectAll()}
      >
        <IoniconsIcon
          name="checkmark-done"
          size={24}
          color={color.textBlack}
        />
      </Button>

      {
        selectedItems.length > 0 && (
          <>
            <Button
              preset="link"
              onPress={() => setShowShareModal(true)}
              style={BUTTON_RIGHT}
            >
              <FontAwesomeIcon
                name="share-square-o"
                size={20}
                color={color.textBlack}
              />
            </Button>
          </>
        )
      }

      <Button
        preset="link"
        style={BUTTON_RIGHT}
        onPress={() => openSort && openSort()}
      >
        {
          isDark ? (
            <ConfigIconLight height={17} />
          ) : (
            <ConfigIcon height={17} />
          )
        }
      </Button>

      <Button
        preset="link"
        style={BUTTON_RIGHT}
        onPress={() => openAdd && openAdd()}
      >
        {
          isDark ? (
            <PlusIconLight height={18} />
          ) : (
            <PlusIcon height={18} />
          )
        }
      </Button>
    </View>
  )

  // Select left
  const renderHeaderSelectLeft = () => (
    <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { marginLeft: -8 }]}>
      <Button
        preset="link"
        style={BUTTON_LEFT}
        onPress={() => {
          setSelectedItems([])
          navigation.goBack()
        }}
      >
        <IoniconsIcon
          name="close"
          size={26}
          color={color.title}
        />
      </Button>

      <Text
        preset="black"
        text={selectedItems.length ? `${selectedItems.length} ${translate('common.selected')}` : translate('common.select')}
        style={{
          fontSize: fontSize.h5,
          marginLeft: 5
        }}
      />
    </View>
  )

  // Actions

  // ----------------------- RENDER ------------------------

  return (
    <Header
      right={renderHeaderSelectRight()}
      left={renderHeaderSelectLeft()}
    >
      <SearchBar
        style={{ marginTop: 15 }}
        onSearch={onSearch}
        value={searchText}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        cipherIds={selectedItems}
        onSuccess={() => {
          setSelectedItems([])
          navigation.goBack()
        }}
      />
    </Header>
  )
})
