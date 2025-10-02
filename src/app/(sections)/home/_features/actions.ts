'use server'

import { prisma } from '@/lib/prisma'
import { QuotationStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { getUserFromToken } from '../../auth/_features/action';
import { transformToIdAndValueSelectOptions, transformToSelectOptions } from '@/app/utils/transformToSelectOptions';

export const getCategories = async () => {

    const cetegories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
    })

    return transformToSelectOptions(cetegories)
}

export async function getCurrenciesCatalog(): Promise<{ label: string, value: string }[]> {
    const currencies = await prisma.currency.findMany({});

    return transformToIdAndValueSelectOptions(currencies);
}

export async function getCompanyProductCatalog() {
    try {
        const user = await getUserFromToken()


        const products = await prisma.product.findMany({
            where: { companyId: user.companyId },
            select: { id: true, name: true, sku: true, price: true },
            orderBy: { name: "asc" },
        });

        const productsOptions = products.map((p) => ({
            value: p.id,
            label: `${p.name} - ${p.sku} - ${p.price}`,
        }));

        return {
            success: true,
            data: productsOptions,
            message: "Catálogo de productos obtenido correctamente",
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "No se pudieron obtener estadísticas",
            data: [],
        };
    }
}


export async function getCompanyClientCatalog() {
    try {
        const user = await getUserFromToken();

        const clients = await prisma.client.findMany({
            where: { companyId: user.companyId },
            select: { id: true, fullName: true, companyName: true, cuit: true },
            //   orderBy: { name: "asc" },
        });

        const optionsClients = clients.map((client) => ({
            value: client.id,
            label: client.companyName ? `${client.companyName} - ${client.cuit}` : `${client.fullName} - ${client.cuit}`,
        }));


        return {
            success: true,
            data: optionsClients,
            message: "Catálogo de clientes obtenido correctamente",
        };

    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "No se pudieron obtener clientes",
            data: [],
        };
    }

}

function getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

export async function getStats(currency?: string) {

    let currencyId: number | null = null;
    let currencyLabel: string | null = null;

    const currencyIdStr = currency && currency as string | null;
    if (currencyIdStr && !isNaN(Number(currencyIdStr))) {
        currencyId = Number(currencyIdStr);
    }

    try {
        const user = await getUserFromToken();
        const companyId = user.companyId;

        // En caso que no venga el currency id usamos la que tiene asignada al compania
        if (!currencyId) {
            // Buscamos la compania
            const company = await prisma.company.findUnique({
                where: { id: companyId },
                include: { currency: true },
            });
            // Asiganamos el id de la currency
            currencyId = company?.currency?.id || null;
            currencyLabel = company?.currency?.value || null;
        } else {
            // Buscar el label de la moneda por id
            const currency = await prisma.currency.findUnique({
                where: { id: currencyId },
            });
            currencyLabel = currency?.value || null;
        }

        const now = dayjs();
        const last30DaysStart = now.subtract(30, "day").startOf("day").toDate();
        const prev30DaysStart = now.subtract(60, "day").startOf("day").toDate();
        const prev30DaysEnd = now.subtract(30, "day").endOf("day").toDate();

        // ------- Total Cotizado (últimos 30 días)
        const quotedAgg = await prisma.quotation.aggregate({
            _sum: { totalAmount: true },
            where: {
                companyId,
                quotationDate: { gte: last30DaysStart },
                ...(currencyId ? { currencyId } : {}),
            },
        });
        const totalQuoted = quotedAgg?._sum?.totalAmount?.toNumber() || 0;

        // ------- Total Cotizado (30-60 días atrás)
        const prevQuotedAgg = await prisma.quotation.aggregate({
            _sum: { totalAmount: true },
            where: {
                companyId,
                quotationDate: {
                    gte: prev30DaysStart,
                    lte: prev30DaysEnd,
                },
                ...(currencyId ? { currencyId } : {}),
            },
        });
        const previousTotal = prevQuotedAgg?._sum?.totalAmount?.toNumber() || 0;
        const percentageChange = getPercentageChange(totalQuoted, previousTotal);

        // ------- Total Vendido (últimos 30 días)
        const validStatuses = [
            QuotationStatus.CONFIRMED,
            QuotationStatus.PARTIAL_PAYMENT,
            QuotationStatus.PAID,
        ];
        const soldAgg = await prisma.quotation.aggregate({
            _sum: { totalAmount: true },
            where: {
                companyId,
                quotationDate: { gte: last30DaysStart },
                status: { in: validStatuses },
                ...(currencyId ? { currencyId } : {}),
            },
        });
        const currentSold = soldAgg?._sum?.totalAmount?.toNumber() || 0;

        // ------- Total Vendido (30-60 días atrás)
        const prevSoldAgg = await prisma.quotation.aggregate({
            _sum: { totalAmount: true },
            where: {
                companyId,
                quotationDate: {
                    gte: prev30DaysStart,
                    lte: prev30DaysEnd,
                },
                status: { in: validStatuses },
                ...(currencyId ? { currencyId } : {}),
            },
        });
        const previousSold = prevSoldAgg?._sum?.totalAmount?.toNumber() || 0;
        const percentagetotalSold = getPercentageChange(currentSold, previousSold);

        // ------- Por Cobrar (últimos 30 días)
        const toCollectAgg = await prisma.quotation.aggregate({
            _sum: { totalAmount: true },
            where: {
                companyId,
                quotationDate: { gte: last30DaysStart },
                status: { in: [QuotationStatus.CONFIRMED] },
                ...(currencyId ? { currencyId } : {}),
            },
        });
        const amountToCollect = toCollectAgg?._sum?.totalAmount?.toNumber() || 0;

        // ------- Clientes Activos
        const activeClientsCount = await prisma.quotation.groupBy({
            by: ["clientId"],
            where: {
                companyId,
                quotationDate: { gte: last30DaysStart },
                status: { in: validStatuses },
                ...(currencyId ? { currencyId } : {}),
            },
            _count: { clientId: true },
        }).then((res) => res.length);

        return {
            success: true,
            data: [
                {
                    label: "Total Cotizado",
                    value: `$${totalQuoted}`,
                    currency: currencyLabel,
                    change: percentageChange,
                },
                {
                    label: "Total Vendido",
                    value: `$${currentSold}`,
                    currency: currencyLabel,
                    change: percentagetotalSold,
                },
                {
                    label: "Por Cobrar",
                    value: `$${amountToCollect}`,
                    currency: currencyLabel,
                    change: null,
                },
                {
                    label: "Clientes Activos",
                    value: activeClientsCount,
                    currency: null,
                    change: null,
                },
            ],
            message: "Estadísticas obtenidas"
        }

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "No se pudieron obtener estadísticas",
            data: [],
        };
    }
}



