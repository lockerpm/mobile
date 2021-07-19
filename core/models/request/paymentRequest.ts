import { PaymentMethodType } from '../../enums/paymentMethodType';
import { OrganizationTaxInfoUpdateRequest } from './organizationTaxInfoUpdateRequest';

export class PaymentRequest extends OrganizationTaxInfoUpdateRequest {
    paymentMethodType: PaymentMethodType;
    paymentToken: string;
}
