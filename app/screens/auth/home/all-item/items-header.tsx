import React from "react"
import { View } from "react-native"
import { Button, Header } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { Input } from "native-base"

interface Props {
  openSort?: Function,
  openAdd?: Function,
  onSearch?: Function
}

export const ItemsHeader = (props: Props) => {
  const { openAdd, openSort, onSearch } = props

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
              size={18} 
              color={color.title}
            />
          </Button>
          
          <Button 
            preset="link"
            onPress={() => openAdd && openAdd()}
          >
            <EntypoIcon 
              name="plus"
              size={21} 
              color={color.title} 
            />
          </Button>
        </View>
      )}
    >
      <View style={{ marginTop: 15 }}>
        <Input
          size="xs"
          placeholder="Search"
          onChangeText={(text) => onSearch(text)}
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
}