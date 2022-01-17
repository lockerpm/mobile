import { ApiResponse } from "apisauce"
import { ISimpleType } from "mobx-state-tree"
import { GetPlanResult } from "."
import { PlanSnapshot } from "../../models"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"

export class PaymentApi {
    private api: Api

    constructor(api: Api) {
        this.api = api
    }
    // --------------------- ID -----------------------------

    private parsePrice = (price: any): {usd: ISimpleType<number> , vnd: ISimpleType<number>, duration: ISimpleType<string>} => {
        return {
            usd : price.usd,
            vnd : price.vnd,
            duration: price.duration
        };
    }
    private convertPlan = (raw: any): PlanSnapshot => {
        const plan: PlanSnapshot = {
            id: raw.id,
            name: raw.name,
            alias: raw.alias,
            halfYearlyPrice: this.parsePrice(raw.half_yearly_price),
            price: this.parsePrice(raw.price),
            yearlyPrice: this.parsePrice(raw.yearly_price)
        }
        
        return plan
    }

    // Get user info from ID
    async getPlans(): Promise<GetPlanResult> {
        try {
            // make the api call
            const response: ApiResponse<any> = await this.api.apisauce.get('/resources/cystack_platform/pm/plans')
            // the typical ways to die when calling an api
            if (!response.ok) {
                const problem = getGeneralApiProblem(response)
                if (problem) return problem
            }

            // transform data 


            const rawPlans = response.data

            const convertPlans: PlanSnapshot[] = rawPlans.map(this.convertPlan);
            // console.log(convertPlans)
            return { kind: "ok", data: convertPlans }
        } catch (e) {
            __DEV__ && console.log(e.message)
            return { kind: "bad-data" }
        }
    }
}
