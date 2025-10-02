import { Country, UserRole } from "@prisma/client";
import z from "zod";

export const createCompanySchema = z.object({
    companyName: z.string().min(1, "Nombre requerido"),
    businessIdentifier: z.string().min(1, "Identificador requerido"),
    country: z.enum(Country, { error: "País requerido" }),

    email: z.string().email("Email inválido"),
    cuit: z.string().min(1, "CUIT requerido"),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    logoUrl: z.string().url("URL inválida").optional().nullable(),

    // Relación con moneda
    currencyId: z.number({ error: "Moneda requerida" }).optional(),

    users: z.array(
        z.object({
            fullName: z.string().min(1, "Nombre requerido"),
            email: z.string().email("Email inválido"),
            password: z.string().min(6, "Mínimo 6 caracteres"), // para admin inicial
            role: z.enum(UserRole).default(UserRole.ADMIN),
        })
    ).min(1, "Debe incluir al menos un usuario"),
});


export const editComapanySchema = createCompanySchema.extend({
    id: z.number().optional(),
    currencyId: z.number().optional(),
    businessIdentifier: z.string().min(1).optional(),
    country: z.enum(Country, { error: "País requerido" }).optional(),
    users: z.array(
        z.object({
            fullName: z.string().min(1, "Nombre requerido"),
            email: z.string().email("Email inválido"),
            password: z.string().min(6, "Mínimo 6 caracteres"), // para admin inicial
            role: z.enum(UserRole).default(UserRole.ADMIN),
        })
    ).optional().nullish()
});