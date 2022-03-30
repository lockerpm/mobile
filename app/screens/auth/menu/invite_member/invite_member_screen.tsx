import React, { useState, useEffect } from "react"
import { View, StyleSheet, TouchableOpacity, Alert, ViewStyle } from "react-native"
import { Text, Layout, Header } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import Modal from "react-native-modal";

export const InviteMemberScreen = observer(function InviteMemberScreen() {
    const navigation = useNavigation()
    const { user } = useStores()
    const { translate, color } = useMixins()

    // ----------------------- PARAMS -----------------------
    const CENTER_VIEW: ViewStyle = {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        position: "absolute",
        top: 20
    }
    return (
        <Layout

            containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
        >
            <View style={CENTER_VIEW} >
                <Modal isVisible={true}>
                    <View style={{ backgroundColor: color.background, padding: 20, borderRadius: 16}}>
                        {/* <Image style={{alignSelf: "center", height: 180}} source={require("./assets/EmergencyContact.png")} /> */}
                        <Text preset="header">{translate('manage_plan.feature.emergency_contact.header')}</Text>
                        <Text preset="black" style={{marginTop: 12}}>{translate('manage_plan.feature.emergency_contact.text')}</Text>
                        <Text preset="black" style={{marginVertical: 16}}>{translate('manage_plan.feature.emergency_contact.link')}</Text>        
                        {/* <Button text={translate('manage_plan.feature.emergency_contact.button')} onPress={() => setModalVisible(false)} /> */}
                         {/*                      
                        <TouchableOpacity  onPress={() => Linking.openURL("https://locker.io/settings/security")}>
                            <Text >Go to locker.io/vault</Text>
                        </TouchableOpacity> */}
                    </View>
                </Modal>
            </View>
            
        </Layout>
    )
})