import React from "react"
import { View } from "react-native"
import { Button, Header, Text } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import Icon from 'react-native-vector-icons/FontAwesome'
import { Input } from "native-base"

interface Props {
  openSort?: Function,
  openAdd?: Function,
  navigation: any
}

export const PasswordsHeader = (props: Props) => {
  const { openAdd, openSort, navigation } = props

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
            style={{ marginRight: 20 }}
            onPress={() => openSort && openSort()}
          >
            <Icon 
              name="sliders"
              size={19} 
              color={color.title}
            />
          </Button>
          
          <Button 
            preset="link"
            onPress={() => openAdd && openAdd()}
          >
            <Icon 
              name="plus"
              size={18} 
              color={color.title} 
            />
          </Button>
        </View>
      )}
    >
      <View style={{ marginTop: 5 }}>
				<Text 
					preset="largeHeader"
					text="Password"
          style={{ marginBottom: 10 }}
				/>
				
        <Input
          size="xs"
          placeholder="Search"
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
              <Icon 
                name="search"
                size={16} 
                color={color.text} 
              />
            </Button>
          }
        />
      </View>
    </Header>
  )
}