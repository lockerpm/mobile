import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { LOGIN_METHOD } from "app/static/types"

export type LoginRoute = {
  login: {
    initMethod?: LOGIN_METHOD
    email?: string
  }
  loginByPincode: {
    email: string
    // user register by password of not
    havePassword: boolean
  }
}

export type LoginScreenProps<T extends keyof LoginRoute> = NativeStackScreenProps<LoginRoute, T>
