import { MessagingService as MessagingServiceAbstraction } from "../../../../core/abstractions"


export class MobileMessagingService implements MessagingServiceAbstraction {
    send(subscriber: string, arg?: any) {
        console.log(`Messaging service: ${subscriber} --- ${arg}`)
    }
}