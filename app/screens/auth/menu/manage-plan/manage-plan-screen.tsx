import React, { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, ViewStyle } from "react-native"
import { Layout, Header, Text, Button, PlanStorage } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
// import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
// import {GooglePayScreen} from "./payment/goole-pay"
// import {ApplePayScreen} from "./payment/apple-pay"



export const ManagePlanScreen = observer(function ManagePlanScreen() {

  const navigation = useNavigation()
  const { translate, notify, color, isDark } = useMixins()
  const { user, uiStore } = useStores()

  const backgroundColor = isDark ? color.background : color.block

  const [isLoading, setIsLoading] = useState(false)


  const tableHead = ['Head', 'Head2', 'Head3', 'Head4']
  const tableData = [
    ['1', '2', '3', '4'],
    ['a', 'b', 'c', 'd'],
    ['1', '2', '3', '4'],
    ['a', 'b', 'c', 'd']
  ]
  const CONTAINER: ViewStyle = {
    backgroundColor: isDark ? color.block : color.background,
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 14,
  }
  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('settings.import')}
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <ScrollView>
        {/* User info */}
        <View style={[
          CONTAINER,
          { marginBottom: 15, paddingVertical: 14 }
        ]}>
          <View>
            <Text style={{ fontSize: 18, marginTop: 5 }}>
              {user.plan && user.plan.name}
            </Text>
            <Button>
              <Text style={{ color: "white" }}>asdasd </Text>
            </Button>
          </View>
          <View>
            <View>
              <Text>Dung lượng gói đăng ký</Text>
              <Text>Giới hạn kho của bạn.</Text>
            </View>

            <View>
              <PlanStorage title="asd" value={10} limits={100}></PlanStorage>
              <PlanStorage title="asd" value={10} limits={100}></PlanStorage>
              <PlanStorage title="asd" value={10} limits={100}></PlanStorage>
              <PlanStorage title="asd" value={10} limits={100}></PlanStorage>
            </View>
          </View>
          <View>
            <Text>Extra Security</Text>
            <Text>Data Breach Scanner, Weak Password Detection, Password Re-usage Detection, and Emergency Access.*</Text>
          </View>
          <View>
            <Text>Utilities</Text>
            <Text>Additional features for more convenient including sharing passwords and unlimited logged-on devices.</Text>
          </View>
        </View>
        <View>
          <View>
            <Text>Payment Method</Text>
          </View>
        </View>

        <View>
          <View>
            <Text>Billing Documents</Text>
          </View>
          <View style={styles.container}>
        {/* <Table borderStyle={{borderColor: 'transparent'}}>
          <Row data={tableHead} style={styles.head} textStyle={styles.text}/>
          {
            tableData.map((rowData, index) => (
              <TableWrapper key={index} style={styles.row}>
                {
                  rowData.map((cellData, cellIndex) => (
                    <Cell key={cellIndex} data={cellData} textStyle={styles.text}/>
                  ))
                }
              </TableWrapper>
            ))
          }
        </Table> */}
      </View>
        </View>
      </ScrollView>
    </Layout>
  )
})

const styles = StyleSheet.create({
  payButton: {
    width: 152,
    height: 40,
  },

  standardButton: {
    width: 90,
    height: 40,
  },
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#808B97' },
  text: { margin: 6 },
  row: { flexDirection: 'row', backgroundColor: '#FFF1C1' },
  btn: { width: 58, height: 18, backgroundColor: '#78B7BB',  borderRadius: 2 },
  btnText: { textAlign: 'center', color: '#fff' }
});



