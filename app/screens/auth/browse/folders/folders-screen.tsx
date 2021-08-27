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
import { NewFolderModal } from "./new-folder-modal"
import { FolderAction } from "./folder-action"
import { RenameFolderModal } from "./rename-folder-modal"
import { FOLDER_IMG } from "../../../../common/mappings"


export const FoldersScreen = observer(function FoldersScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)

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
          openAdd={() => setIsAddOpen(true)}
          navigation={navigation}
        />
      )}
      borderBottom
      noScroll
    >
      {/* Modals / Actions */}
      <FolderAction 
        isOpen={isActionOpen} 
        onClose={() => setIsActionOpen(false)}
        rename={() => setIsRenameOpen(true)}
      />

      <SortAction 
        isOpen={isSortOpen} 
        onClose={() => setIsSortOpen(false)}
      />

      <NewFolderModal 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <RenameFolderModal 
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
      />
      {/* Modals / Actions end */}

      {/* Content */}
      {
        !sections.length ? (
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title="Organize items in Folder"
            desc="Keep passwords and other items in groups"
            buttonText="Add Folder"
            addItem={() => {
              setIsAddOpen(true)
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
                      source={FOLDER_IMG.normal.img}
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
                      onPress={() => setIsActionOpen(true)}
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
      {/* Content end */}
    </Layout>
  )
})
