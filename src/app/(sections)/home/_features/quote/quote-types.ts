import { Prisma } from "@prisma/client";

export type QuotesWithRelations = Prisma.QuotationGetPayload<{
    include: {
        client: true,
        items: true,
        currency: true
    };
}>;

// Nuevo tipo para frontend, donde pasamos Decimal a number
export type PlainQuotationItem = Omit<QuotesWithRelations['items'][number], 'unitPrice' | 'totalPrice'> & {
    unitPrice: number;
    totalPrice: number;
};

export type PlainQuotesWithRelations = Omit<QuotesWithRelations, 'items' | 'totalAmount' | 'taxRate'> & {
    totalAmount: number;
    items: PlainQuotationItem[];
    taxRate: number | null;
};


export interface ResQuoteList {
    success: boolean | null;
    message: string;
    data: PlainQuotesWithRelations[];
    total: number;
}


export type QuotesDetails = Prisma.QuotationGetPayload<{
    include: {
        company: true;
        client: true;
        items: {
            include: {
                product: true
            }
        }
    };
}>;

export type PlainQuotesDetails = Omit<
    QuotesDetails,
    "totalAmount" | "items" | "taxRate"
> & {
    taxRate: number | null;
    totalAmount: number;
    items: (Omit<QuotesDetails["items"][number], "unitPrice" | "totalPrice"> & {
        unitPrice: number;
        totalPrice: number;
    })[];
};

export interface ResponseDetails {
    success: boolean;
    data: PlainQuotesDetails;
    message: string;
}

