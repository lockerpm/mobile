interface Price {
    usd: number,
    vnd: number,
    duration: string
}

export interface UserPlanProps {
  
    alias: string

    cancel_at_period_end: boolean
  
 
    duration: string
  
    half_yearly_price: Price
  
    id: number

    max_number: number

    name: string

    next_billing_time? : string

    number_members: number

    payment_method: string
  
    price: Price

    subscribing: boolean

    yearly_price: Price
  }
  