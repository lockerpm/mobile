import { StackScreenProps } from "@react-navigation/stack"

export type UnAuthRoute = {
  intro: undefined
  onBoarding: undefined
  loginStack: undefined
  signupStack: undefined
  ssoStack: undefined

  createMasterPassword: undefined
  forgotPassword: {
    email?: string
  }
}

export type UnAuthScreenProps<T extends keyof UnAuthRoute> = StackScreenProps<UnAuthRoute, T>
