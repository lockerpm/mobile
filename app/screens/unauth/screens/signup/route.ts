import { NativeStackScreenProps } from "@react-navigation/native-stack"

export type SignupRoute = {
  signup: undefined
  signupPinCode: {
    email: string
    getNews: boolean
  }
  signupPassword: {
    email: string
  }
}

export type SignUpScreenProps<T extends keyof SignupRoute> = NativeStackScreenProps<SignupRoute, T>
