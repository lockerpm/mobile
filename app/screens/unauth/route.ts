import { NavigatorScreenParams } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

import { LoginRoute } from "./screens/login/route"
import { SignupRoute } from "./screens/signup/route"
import { SSORoute } from "./screens/sso/route"

export type UnAuthRoute = {
  intro: undefined
  onBoarding: undefined
  createMasterPassword: undefined
  forgotPassword: {
    email?: string
  }
  loginStack: NavigatorScreenParams<LoginRoute>
  signupStack: NavigatorScreenParams<SignupRoute>
  ssoStack: NavigatorScreenParams<SSORoute>
}

export type UnAuthScreenProps<T extends keyof UnAuthRoute> = NativeStackScreenProps<UnAuthRoute, T>
