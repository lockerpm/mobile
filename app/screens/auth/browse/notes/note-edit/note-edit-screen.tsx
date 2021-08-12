import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { 
  AutoImage as Image, Text, Layout, Button, Header, FloatingInput, CipherOthersInfo
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, commonStyles } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"


type NoteEditScreenProp = RouteProp<PrimaryParamList, 'notes__edit'>;


export const NoteEditScreen = observer(function NoteEditScreen() {
  const navigation = useNavigation()
  const route = useRoute<NoteEditScreenProp>()
  const { mode } = route.params

  // Forms
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')

  return (
    <Layout
      containerStyle={{ 
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={mode === 'add' ? 'Add Secure Note' : 'Edit'}
          goBack={() => navigation.goBack()}
          goBackText="Cancel"
          right={(
            <Button
              preset="link"
              text="Save"
              textStyle={{
                fontSize: 12
              }}
            />
          )}
        />
      )}
    >
      {/* Title */}
      <View
        style={[commonStyles.SECTION_PADDING, { backgroundColor: color.palette.white }]}
      >
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW]}
        >
          <Image
            source={BROWSE_ITEMS.note.icon}
            style={{ height: 40, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <FloatingInput
              isRequired
              label="Title"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>
      </View>
      {/* Title end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text text="DETAILS" style={{ fontSize: 10 }} />
      </View>

      {/* Info */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingBottom: 32
        }]}
      >
        {/* Note */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            fixedLabel
            textarea
            label="Note"
            value={note}
            onChangeText={setNote}
          />
        </View>
        {/* Note end */}
      </View>
      {/* Info end */}

      {/* Others */}
      <CipherOthersInfo
        navigation={navigation}
        mode={mode === 'add' ? 'add' : 'move'}
      />
      {/* Others end */}
    </Layout>
  )
})
