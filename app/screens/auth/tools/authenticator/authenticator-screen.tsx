import React from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/core"
import { useMixins } from "../../../../services/mixins"
import { Header, Layout, Button } from "../../../../components"
import { color } from "../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'


export const AuthenticatorScreen = observer(function AuthenticatorScreen() {
  const { translate } = useMixins()
  const navigation = useNavigation()


  // -------------------- RENDER ----------------------

  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={translate('authenticator.title')}
          goBack={() => navigation.goBack()}
          right={(
            <Button 
              preset="link" 
              onPress={() => {
                navigation.navigate('qrScanner')
              }}
              style={{ height: 30, alignItems: 'center'}}
            >
              <IoniconsIcon
                name="qr-code-outline"
                size={20}
                color={color.textBlack}
              />
            </Button>
          )}
        />
      )}
    >
      
    </Layout>
  )
})
