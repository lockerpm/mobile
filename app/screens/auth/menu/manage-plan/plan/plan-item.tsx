import React, { useState } from "react"
import { useMixins } from "../../../../../services/mixins";
import { PlanSnapshot } from "../../../../../models/plan/plan";
import { View, StyleSheet, Text, TouchableOpacity} from "react-native"




interface Props {
    selected: number
    plan: PlanSnapshot,
    features: string[],
    onSelect?(id): void;
}

const Plan: React.FC<Props> = ({
    selected,
    plan,
    features,
    onSelect
}) => {

    //test
    const [load, setLoad] = useState(false);
    const {color} = useMixins();
    const borderColor = selected === plan.id ? color.primary : "rgba(230, 230, 232, 1)"

    const handleSelected = () => {
        onSelect(plan.id);
        console.log(plan.id);
        
    }

    return (
        <TouchableOpacity onPress={handleSelected} style={[styles.container, { borderColor: borderColor,}]}>
            <View style={styles.text}>
                <Text style={styles.label}>{plan.name}</Text>
                <Text style={styles.description}>{plan.alias}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>{plan.price.usd}</Text>
                    <Text style={[styles.description, { marginTop: 14 }]}>{plan.price.duration}</Text>
                </View>
                <View style={styles.featuresContainer}>
                    {
                        features.map((i) => {
                            return <Text key={i} style={styles.feature}> + {i}</Text>
                        })
                    }
                </View>
            </View>

        </TouchableOpacity>
    )

}

const styles = StyleSheet.create({
    container: {
        margin: 20,
        padding: 15,
        borderWidth: 1,
        borderRadius: 5,
        position: "relative",
        borderStyle: 'solid',
        display: 'flex',
    },
    text: {

        // height: "100%",
        display: "flex",
        flexDirection: "column"
    },
    label: {
        padding: 4,
        textTransform: "uppercase",
        backgroundColor: 'black',
        alignSelf: 'center',
        color: "white"
    },
    description: {
        marginTop: 0.5,
        color: 'rgba(97, 114, 150, 1)'
    },
    priceContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
    },
    price: {
        marginRight: 15,
        fontWeight: "500",
        fontSize: 30,
    },
    featuresContainer: {
        marginTop: 10,
    },
    feature: {
        marginLeft: 6,
    }

});


export default Plan;
