import React, { useState } from "react"
import { View, TouchableOpacity } from "react-native"
import { Text, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import AntDesign from 'react-native-vector-icons/AntDesign'


interface ImportResultProps {
    imported: number
    total: number
    isLimited?: boolean
}

export const ImportResult = (props: ImportResultProps) => {
    const navigation = useNavigation()
    const { translate, color } = useMixins()

    const isAllImported = props.imported == props.total
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
                <View>
                    <Text preset="bold" text={translate("import.imported_free.guild")} />
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
        </View>
    )
}
