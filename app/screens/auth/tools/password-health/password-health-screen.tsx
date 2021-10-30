import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../../../services/mixins"
import { Button, Header, Layout, Text } from "../../../../components"
import { color, commonStyles, fontSize } from "../../../../theme"

// @ts-ignore
import DataBreachScannerIcon from './data-breach-scanner.svg'


export const PasswordHealthScreen = observer(function PasswordHealthScreen() {
  const { translate } = useMixins()
  const navigation = useNavigation()

  // -------------------- RENDER ----------------------

  const renderOption = (title: string, desc: string, left: React.ReactNode, bordered?: boolean) => (
    <Button
      preset="link"
      onPress={() => {
        
      }}
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        borderBottomColor: color.line,
        borderBottomWidth: bordered ? 1 : 0,
        justifyContent: 'space-between',
        paddingVertical: 16,
      }]}
    >
      <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        flex: 1
      }]}>
        { left }

        <View style={{ paddingHorizontal: 10, flex: 1 }}>
          <Text
            preset="black"
            text={title}
          />
          <Text
            text={desc}
            style={{
              marginTop: 3,
              fontSize: fontSize.small
            }}
          />
        </View>
      </View>
      
      <FontAwesomeIcon
        name="angle-right"
        size={18}
        color={color.textBlack}
      />
    </Button>
  )

  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={translate('pass_health.title')}
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 10 }} />
          )}
        />
      )}
    >
      <View style={commonStyles.GRAY_SCREEN_SECTION}>
        {
          renderOption(
            'Exposed Passwords',
            'Passwords that have been uncovered in known data breaches',
            (
              <DataBreachScannerIcon height={40} width={40} />
            )
          )
        }
      </View>
    </Layout>
  )
})
