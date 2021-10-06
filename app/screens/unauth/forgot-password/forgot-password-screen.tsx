import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { Layout } from "../../../components"
import { Step1 } from "./step1"
import { Step2 } from "./step2"
import { Step3 } from "./step3"
import { Step4 } from "./step4"


export const ForgotPasswordScreen = observer(function ForgotPasswordScreen() {
  const navigation = useNavigation()

  // ------------------------------ PARAMS -------------------------------

  const [index, setIndex] = useState(0)
  const [methods, setMethods] = useState([])
  const [method, setMethod] = useState('')
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')


  // ------------------------------ METHODS -------------------------------

  // ------------------------------ RENDER -------------------------------

  return (
    <Layout>
      {
        index === 0 && (
          <Step1
            nextStep={(methods: { type: string, data: any }[]) => {
              setMethods(methods)
              setIndex(1)
            }}
            goBack={() => navigation.goBack()}
          />
        )
      }
      {
        index === 1 && (
          <Step2
            goBack={() => setIndex(0)}
            methods={methods}
            onSelect={(type: string, data: any) => {
              setMethod(type)
              setUsername(data[0])
              setIndex(2)
            }}
          />
        )
      }
      {
        index === 2 && (
          <Step3
            goBack={() => setIndex(1)}
            username={username}
            nextStep={(token: string) => {
              setToken(token)
              setIndex(3)
            }}
          />
        )
      }
      {
        index === 3 && (
          <Step4
            goBack={() => setIndex(2)}
            token={token}
            nextStep={() => {
              navigation.navigate('login')
            }}
          />
        )
      }
    </Layout>
  )
})
