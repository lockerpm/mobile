import React, { useState } from "react"
import { View, Image } from "react-native"
import { Text } from "../../../../components"
import { useMixins } from "../../../../services/mixins"
import { ProgressBar } from "react-native-ui-lib"
import AntDesign from 'react-native-vector-icons/AntDesign'


interface ImportProgressProps {
    imported: number
    total: number
    file: string
}

export const ImportProgress = (props: ImportProgressProps) => {
    const { translate, color } = useMixins()
    return (
        <View>
            <View style={{ alignItems: "center", marginBottom: 30 }}>
              <Image source={require('./FileArrowUp.png')} style={{ width: 32, height: 32 }} />
              <Text preset="bold" text={translate("import.progress")} />
            </View>


            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <View style={{
                flexDirection: "row"
              }}>
                <AntDesign name="file1" size={24} />
                <Text preset="black" style={{ maxWidth: 250, marginLeft: 5 }}>{props.file}</Text>
              </View>

              <Text preset="black"> {props.imported}/{props.total}</Text>
            </View>
            <ProgressBar
              height={6}
              containerStyle={{
                borderRadius: 4
              }}
              progressBackgroundColor={color.block}
              backgroundColor={color.primary}
              // @ts-ignore
              progress={(props.imported / props.total * 100)}
            />
          </View>
    )
}
