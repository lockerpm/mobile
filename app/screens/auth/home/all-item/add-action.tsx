import React from "react"
import { Actionsheet } from "native-base"
import { Text, AutoImage as Image } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import { BROWSE_ITEMS } from "../../../../common/mappings"
import { View, ScrollView } from "react-native"

interface Props {
  isOpen?: boolean,
  onClose?: Function,
  navigation?: any
}

export const AddAction = (props: Props) => {
  return (
    <Actionsheet
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <Actionsheet.Content>
        <ScrollView
          style={{ width: '100%' }}
        >
          {
            Object.values(BROWSE_ITEMS).filter(item => item.addable).map((item, index) => (
              <Actionsheet.Item 
                key={index}
                onPress={() => {
                  props.navigation.navigate(`${item.routeName}__edit`, {
                    mode: 'add'
                  })
                }}
                style={{ borderBottomColor: color.line, borderBottomWidth: 1 }}
              >
                <View
                  style={[commonStyles.CENTER_HORIZONTAL_VIEW]}
                >
                  <Image
                    source={item.icon}
                    style={{ height: 40, marginRight: 12 }}
                  />
                  <Text
                    text={item.label}
                    style={{ color: color.textBlack }}
                  />
                </View>
              </Actionsheet.Item>
            ))
          }
        </ScrollView>
      </Actionsheet.Content>
    </Actionsheet>
  )
}