import React, { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, ViewStyle, Alert } from "react-native"
import { Layout, Header, Text, Button, PlanStorage } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
// import { commonStyles } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
// import {GooglePayScreen} from "./payment/goole-pay"
// import {ApplePayScreen} from "./payment/apple-pay"

// @ts-ignore
import LightingIcon from './lighting.svg'


export const ManagePlanScreen = observer(function ManagePlanScreen() {

  const navigation = useNavigation()
  const { translate, color, isDark } = useMixins()
  const { user } = useStores()

  // const backgroundColor = isDark ? color.background : color.block

  const [isLoading, setIsLoading] = useState(false)
  const [tableData, setTableData] = useState([])


  const fetchInvoices = async () => {
    const res =  await user.getBillingDocuments(1)
    if (res.kind === "ok") {
      setTable(res.data)
    }
  }


  useEffect(() => {
    setTimeout(fetchInvoices, 1)
  }, [])


  const tableHead = ['ID', 'Created date', 'Plan']
  const setTable = (data: any) => {
    const tableData = []
    data.map((r)=> {
      const row = [r.id, r.created_time, r.duration, r.total_price]
      console.log(row)
      tableData.push(row)
    })
    setTableData(tableData)
  }

  
 
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
          <View style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            marginBottom: 15,

          }}>
            <Text style={{
              fontWeight: "700",
              fontSize: 22,
              color: "black"
            }}>
              {user.plan.name}
            </Text>

            {
              user.plan.name === "Free" && (
                <Button onPress={() => navigation.navigate("payment")}>
                  <LightingIcon />
                  <Text style={{ color: "white", paddingLeft: 10, paddingRight: 10 }}>Buy Premium </Text>
                </Button>
              )
            }

            {
              user.plan.name === "Premium" && (
                <Button style={{ backgroundColor: "#DBDFE140" }} onPress={() => Alert.alert("Cancel subcription", "notting")}>
                  <Text style={{ paddingLeft: 10, paddingRight: 10, color: "#072245"  }}>Cancel subcription </Text>
                </Button>
              )
            }

          </View>
          <View style={{ borderTopColor: "#DBDFE140", borderTopWidth: 1, marginBottom: 15, }}>
            <View style={{ marginTop: 15 }}>
              <Text style={styles.title}>Plan Storage</Text>
              <Text>See your inventory limits.</Text>
            </View>

            {
              user.plan.name === "Free" && (
                <View>
                  <PlanStorage title="Password" value={10} limits={100}></PlanStorage>
                  <PlanStorage title="Note" value={10} limits={100}></PlanStorage>
                  <PlanStorage title="Cards" value={10} limits={100}></PlanStorage>
                  <PlanStorage title="Identities" value={10} limits={100}></PlanStorage>
                </View>
              )
            }

            {
              user.plan.name === "Premium" && (

                <Text style={{ paddingLeft: 10, paddingRight: 10 }}>Unlimited</Text>

              )
            }

          </View>
          <View style={{ borderTopColor: "#DBDFE140", borderTopWidth: 1 }}>
            <Text style={[styles.title, { marginTop: 15 }]} >Extra Security</Text>
            <Text>Data Breach Scanner, Weak Password Detection, Password Re-usage Detection, and Emergency Access.*</Text>
          </View>
          <View>
            <Text style={styles.title}>Utilities</Text>
            <Text>Additional features for more convenient including sharing passwords and unlimited logged-on devices.</Text>
          </View>
        </View>

        <View style={[
          CONTAINER,
          { marginBottom: 15, paddingVertical: 14 }
        ]}>
          <View>
            <View >
              <Text style={styles.title}>Payment Method</Text>
            </View>
          </View>
        </View>

        <View style={[
          CONTAINER,
          { marginBottom: 15, paddingVertical: 14 }
        ]}>
          <View>
            <View>
              <Text style={styles.title}>Billing Documents</Text>
            </View>
          </View>

          <View style={styles.container}>
            <Table borderStyle={{ borderColor: 'transparent' }}>
              <Row data={tableHead} style={styles.head} textStyle={styles.text} />
              {
                tableData.map((rowData, index) => (
                  <TableWrapper key={index} style={styles.row}>
                    {
                      rowData.map((cellData, cellIndex) => (
                        <Cell key={cellIndex} data={cellData} textStyle={styles.text} />
                      ))
                    }
                  </TableWrapper>
                ))
              }
            </Table>
          </View>
        </View>
      </ScrollView>
    </Layout>
  )
})

const styles = StyleSheet.create({
  title: {
    color: "black", fontSize: 18, fontWeight: "500",
  },
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#808B97' },
  text: { margin: 6 },
  row: { flexDirection: 'row', backgroundColor: '#fff' },
});



