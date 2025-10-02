import { CreateQuoteItemDto, EditQuoteItemDto } from "@/schemas/quote/quote.dto";
import { QuotationStatus } from "@prisma/client";

export function calculateIVA(subtotal: number, currency: "ARS" | "CLP"): string {
    const ivaRates: Record<string, number> = {
        ARS: 0.21,
        CLP: 0.19,
    };

    const rate = ivaRates[currency];

    if (!rate) {
        return `$${subtotal}`
    }

    const iva = +(subtotal * rate).toFixed(2);
    const total = +(subtotal + iva).toFixed(2);

    return `$${total}`;
}

type QuoteItemStateType = CreateQuoteItemDto | EditQuoteItemDto;


export function calculateTotals(items: QuoteItemStateType[], iva: number) {
    const subtotal = items.reduce(
        (acc, item) => acc + item.quantity * item.unitPrice,
        0
    );

    const ivaAmount = subtotal * (iva / 100);
    const total = subtotal + ivaAmount;

    return {
        subtotal,
        ivaAmount,
        total,
    };
}


export const getColorStatus = (status: QuotationStatus) => {
    switch (status) {
        case QuotationStatus.DRAFT:
            return ("default");
        case QuotationStatus.SENT:
            return ("blue");
        case QuotationStatus.REJECTED:
            return ("red");
        case QuotationStatus.CONFIRMED:
            return ("cyan");
        case QuotationStatus.PARTIAL_PAYMENT:
            return ("orange");
        case QuotationStatus.PAID:
            return ("green");
        default:
            return ("default");
    }
};