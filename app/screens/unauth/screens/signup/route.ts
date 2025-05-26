import { StackScreenProps } from "@react-navigation/stack"

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

export type SignUpScreenProps<T extends keyof SignupRoute> = StackScreenProps<SignupRoute, T>
