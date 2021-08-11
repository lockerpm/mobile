import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { 
  Layout, BrowseItemHeader, BrowseItemEmptyContent, Text, Button,
  AutoImage as Image
} from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"
import { SectionList, View } from "react-native"
import { color, commonStyles } from "../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'


export const FoldersScreen = observer(function FoldersScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)
  // const sections = []
  const sections = [
    {
      id: 1,
      title: 'CyStack',
      data: [
        {
          id: 3,
          name: 'Platform'
        },
        {
          id: 4,
          name: 'WhiteHub'
        }
      ]
    },
    {
      id: 2,
      title: 'CyStack',
      data: [
        {
          id: 5,
          name: 'Platform'
        },
        {
          id: 6,
          name: 'WhiteHub'
        }
      ]
    }
  ]

  return (
    <Layout
      header={(
        <BrowseItemHeader
          header="Folders"
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {}}
          navigation={navigation}
        />
      )}
      borderBottom
      noScroll
    >
      <SortAction 
        isOpen={isSortOpen} 
        onClose={() => setIsSortOpen(false)}
      />

      {
        !sections.length ? (
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title="Foget password resets"
            desc="Add your passwords and access them on any device, anytime"
            buttonText="Add Password"
            addItem={() => {
              navigation.navigate('passwords__edit', { mode: 'add' })
            }}
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id.toString()}
            renderSectionHeader={({ section }) => (
              <Text
                text={`${section.title} (${section.data.length})`}
                style={{ fontSize: 10, paddingHorizontal: 20, marginTop: 20 }}
              />
            )}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: 20 }}>
                <Button
                  preset="link"
                  style={{
                    borderBottomColor: color.line,
                    borderBottomWidth: 1,
                    paddingVertical: 15,
                  }}
                >
                  <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
                    <Image
                      source={require('./folder.png')}
                      style={{
                        height: 30,
                        marginRight: 12
                      }}
                    />

                    <View style={{ flex: 1 }}>
                      <Text
                        preset="semibold"
                        text={item.name}
                      />
                    </View>

                    <Button
                      preset="link"
                    >
                      <IoniconsIcon
                        name="ellipsis-horizontal"
                        size={16}
                        color={color.textBlack}
                      />
                    </Button>
                  </View>
                </Button>
              </View>
            )}
          />
        )
      }
    </Layout>
  )
})
