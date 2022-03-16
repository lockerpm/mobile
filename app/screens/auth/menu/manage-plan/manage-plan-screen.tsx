import React, { useState, useEffect } from "react"
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { Text, Layout, Header } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import { PremiumFeature } from "./premium-feature"
import { PlanUsage } from "./plan-usage"

export const ManagePlanScreen = observer(function ManagePlanScreen() {
    const navigation = useNavigation()
    const { user } = useStores()
    const { translate, color } = useMixins()

    // ----------------------- PARAMS -----------------------

    return (
        <Layout
            header={(
                <Header
                    goBack={() => {
                        navigation.goBack()
                    }}
                    title={user.plan.name + " Plan"}
                    right={(<View style={{ width: 10 }} />)}
                />
            )}
            containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
        >
           
            <PlanUsage />
            <PremiumFeature />
        </Layout>
    )
})