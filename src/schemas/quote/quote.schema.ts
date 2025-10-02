import { QuotationStatus, QuotationType } from "@prisma/client";
import { z } from "zod";

export const createQuotationItem = z.object({
    sku: z.string(),
    productId: z.number().int().positive(),
    productName: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.string().or(z.number())
        .transform(val => Number(val))
        .refine(val => !isNaN(val) && val >= 0, { message: "Debe ser un número válido" }),
    totalPrice: z.string().or(z.number())
        .transform(val => Number(val))
        .refine(val => !isNaN(val), { message: "Debe ser un número válido" })
        .optional(),
});

export const editQuotationItem = createQuotationItem.extend({
    id: z.number().optional(),
});

export const createQuotationSchema = z.object({

    totalAmount: z
        .string()
        .or(z.number())
        .optional()
        .transform(val => (val === undefined ? 0 : Number(val)))
        .refine(val => !isNaN(val), { message: "Debe ser un número válido" }),

    items: z.array(createQuotationItem),

    status: z.enum(QuotationStatus).default(QuotationStatus.DRAFT),
    quotationType: z.enum(QuotationType).default(QuotationType.WITHOUT_IVA),

    taxRate: z.number()
        .min(0, "Debe ser mayor o igual a 0")
        .max(999.99, "Máximo permitido es 999.99")
        .optional()
        .nullable(),

    quotationDate: z.string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "La fecha debe ser ISO-8601",
        }),
    // .refine(val => !isNaN(Date.parse(val)), { message: "Fecha inválida" })
    // .transform(val => new Date(val)),

    companyId: z.number().int().positive(), // relación implícita
    currencyId: z.number().int().positive(),
    clientId: z.number().int().positive().nullable().optional(), // porque puede ser null

    quotationIdentifier: z.string(),
    quotationValidity: z.string().optional().nullish(),

    note: z.string().optional().nullish(),
    serviceDescription: z.string().optional().nullish(),
    termsOfPayment: z.string().optional().nullish(),
    valGuarantees: z.string().optional().nullish(),
    paymentMethods: z.string().optional().nullish(),
    exclusions: z.string().optional().nullish(),
    tyc: z.string().optional().nullish(),
    additionalInfo: z.string().optional().nullish(),
});


export const editQuotationSchema = createQuotationSchema.extend({
    id: z.number().optional(),
    items: z.array(editQuotationItem),
});


