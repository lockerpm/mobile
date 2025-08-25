import { StyleSheet, View } from "react-native"
import { TextInput } from "app/components/cores"
import { Textarea } from "app/components/utils"
import { CipherAppView } from "app/static/types"
import { TxKeyPath } from "app/i18n"

type Props = {
  item: CipherAppView
}

export const IdentityInfo = ({ item }: Props) => {
  const textFields: { label: TxKeyPath; value: string }[] = [
    {
      label: "identity:title",
      value: item.identity.title,
    },
    {
      label: "identity:first_name",
      value: item.identity.firstName,
    },
    {
      label: "identity:last_name",
      value: item.identity.lastName,
    },
    {
      label: "identity:username",
      value: item.identity.username,
    },
    {
      label: "identity:email",
      value: item.identity.email,
    },
    {
      label: "identity:company",
      value: item.identity.company,
    },
    {
      label: "identity:phone",
      value: item.identity.phone,
    },
    {
      label: "identity:ssn",
      value: item.identity.ssn,
    },
    {
      label: "identity:passport",
      value: item.identity.passportNumber,
    },
    {
      label: "identity:license",
      value: item.identity.licenseNumber,
    },
    {
      label: "identity:address",
      value: item.identity.address1,
    },
    {
      label: "identity:city",
      value: item.identity.city,
    },
    {
      label: "identity:state",
      value: item.identity.state,
    },
    {
      label: "identity:zip",
      value: item.identity.postalCode,
    },
    {
      label: "identity:country",
      value: item.identity.country,
    },
  ]

  return (
    <View>
      {textFields.map(
        (item, index) =>
          item.value && (
            <TextInput
              animated
              key={index}
              isCopyable={!!item.value}
              labelTx={item.label}
              value={item.value}
              editable={false}
              style={styles.mb10}
            />
          )
      )}

      {item.notes && (
        <Textarea labelTx="common:notes" value={item.notes} editable={false} style={styles.mt16} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  mb10: {
    marginBottom: 16,
  },
  mt16: {
    marginTop: 16,
  },
})
