import { EditQuoteDto } from "@/schemas/quote/quote.dto";
import { PlainQuotesWithRelations } from "./quote-types";


export const mapQuoteListToFormValues = (quote: PlainQuotesWithRelations): EditQuoteDto => ({
    id: quote.id,
    companyId: quote.companyId,
    clientId: quote.clientId,
    quotationDate: quote.quotationDate.toString(),
    status: quote.status,
    items: quote.items.map(item => ({
        sku: item.sku,
        productName: item.productName,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
    })),
    totalAmount: Number(quote.totalAmount),
    currencyId: quote.currencyId,
    note: quote.note || "",
    quotationIdentifier: quote.quotationIdentifier || "",
    quotationType: quote.quotationType,
    additionalInfo: quote.additionalInfo || "",
    exclusions: quote.exclusions || "",
    paymentMethods: quote.paymentMethods || "",
    serviceDescription: quote.serviceDescription || "",
    taxRate: Number(quote.taxRate),
    termsOfPayment: quote.termsOfPayment || "",
    tyc: quote.tyc || "",
    valGuarantees: quote.valGuarantees || "",
    quotationValidity: quote.quotationValidity?.toString(),

});