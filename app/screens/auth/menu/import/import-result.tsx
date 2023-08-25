import React, { useState } from "react"
import { View, TouchableOpacity, Image } from "react-native"
import { Text, Button, ActionSheet, ActionSheetContent} from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import AntDesign from 'react-native-vector-icons/AntDesign'

interface Props {
    imported: number
    total: number
    isLimited?: boolean
    setIsLimited: Function
}

export const ImportResult = (props: Props) => {
    const navigation = useNavigation()
    const { translate, color } = useMixins()
    const {user} = useStores()
    const {imported, total, isLimited, setIsLimited} = props
    const isFreeAccount = user.isFreePlan
    const isAllImported = imported == total
    const [isFree, setIsFree] = useState(true)

    return (
        <View>
            <View style={{
                alignItems: "center"
            }}>
                <AntDesign name="check" size={32} color={color.primary} />
                <Text preset="bold" text={translate("import.imported")} style={{ marginTop: 8, marginBottom: 16 }} />

                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    {
                        isAllImported ? <AntDesign name={"check"} size={24} color={color.primary} />
                            : <AntDesign name={"warning"} size={24} color={color.error} />
                    }
                    <Text preset="bold" text={`${props.imported}/${props.total} ` + translate('import.imported_free.result')} style={{
                        color: isAllImported ? color.primary : color.error,
                        marginLeft: 10
                    }} />
                </View>
                {isAllImported && <Button
                    text={translate("import.result_btn")}
                    onPress={() => navigation.navigate("mainTab", {
                    })}
                    style={{
                        width: "100%",
                        marginHorizontal: 20,
                        marginTop: 30,
                        marginBottom: 10
                    }}
                />}
            </View>

            {!isAllImported && isFree && <View
                style={{
                    marginTop: 16,
                    borderWidth: 1,
                    borderColor: "orange",
                    backgroundColor: "#FCFAF0",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    width: "100%",
                }}>
                <View style={{marginRight: 36}}>
                    <Text text={translate("import.imported_free.guild")} style={{color: "black"}} />
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('payment')
                        }}>
                        <Text style={{
                            color: "#007AFF",
                            fontWeight: "700"
                        }}>Upgrade to Premium</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        setIsFree(false)
                    }}>
                    <AntDesign name="close" size={20} color={"black"} />
                </TouchableOpacity>

            </View>}

            <ActionSheet
                isOpen={isLimited && isFreeAccount}
                onClose={() => {
                    setIsLimited(false)
                }}>
                <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
                    <View style={{ alignItems: "center" }}>
                        <Image
                            source={require("./Locker.png")}
                            style={{ height: 60, width: 60, marginBottom: 12 }}
                        />
                        <Text preset="bold" text={translate("import.limited")} style={{ marginBottom: 8 }} />
                        <Text text={`${imported}/${total} ` + translate("import.imported_free.note")} style={{ maxWidth: "90%", textAlign: "center", marginBottom: 16 }} />

                        <Button
                            text="Get Unlimited"
                            onPress={() => {
                                setIsLimited(false)
                                navigation.navigate('payment')
                            }}
                            style={{ marginBottom: 50, width: "90%" }} />
                    </View>
                </ActionSheetContent>
            </ActionSheet>
        </View>
    )
}
