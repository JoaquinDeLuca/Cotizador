"use server"
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { config } from "@/lib/config";
import bcrypt from "bcryptjs";
import { countryToCurrencyMap } from "@/app/constants/optionsSelects";
import { CreateCompanyDto } from "@/schemas/company/company.dto";
import { createCompanySchema } from "@/schemas/company/company.schema";
import { UserRole } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(config.JWT_SECRET);


export const login = async (email: string, password: string) => {
    try {
        // Validamos que existe el usuario
        const user = await prisma.user.findUnique({
            where: {
                email
            },
            include: {
                company: {
                    include: {
                        currency: true
                    }
                }
            }
        });

        if (!user) return {
            error: true,
            message: "Usuario no registrado."
        }

        // Comparamos que la passs coincidan
        const compare = await bcrypt.compare(password, user.password)

        if (!compare) return {
            error: true,
            message: "Credenciales inválidas."
        }


        // Crear payload JWT
        const payload = {
            sub: user.id.toString(),
            userEmail: user.email,
            companyId: user.company.id,
            currency: user.company.currency
        };

        // Firmar token con jose
        const token = await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("2h")
            .sign(secret);

        // Guardar en cookie
        const cookieStore = await cookies();

        cookieStore.set({
            name: "access_token",
            value: token,
            httpOnly: true,
            path: "/",
            maxAge: 3600 * 2,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return {
            error: false,
            message: '¡Login exitoso! Redireccionando al menú principal',
        };
    } catch (error) {
        return {
            error: true,
            message: error instanceof Error ? error.message : 'Error interno del servidor',
        }
    }
}


export async function registerCompany(data: CreateCompanyDto) {
    try {
        const parsed = createCompanySchema.safeParse(data)


        if (!parsed.success) {
            return {
                success: false,
                message: parsed.error.message || 'Datos inválidos',
            }
        }

        // Validar CUIT o según país
        if (parsed.data.country === "ARGENTINA") {
            const existsCuit = await prisma.company.findUnique({
                where: { cuit: parsed.data.cuit },
            });

            if (existsCuit) {
                throw new Error("El CUIT ya está registrado.");
            }
        }

        // Validar identificador de negocio
        const existsIdentifier = await prisma.company.findUnique({
            where: { businessIdentifier: parsed.data.businessIdentifier },
        });

        if (existsIdentifier) {
            throw new Error("El identificador de negocio ya está en uso.");
        }

        // hash del password
        const hashedPassword = await bcrypt.hash(parsed.data.users[0].password, 10);


        // Asignar modena por default
        const currencyValue = countryToCurrencyMap[parsed.data.country]
        const currency = await prisma.currency.findFirst({
            where: { value: currencyValue },
        })

        if (!currency) {
            throw new Error(`Currency "${currencyValue}" no encontrada.`)
        }

        // Crear la empresa con usuario admin
        const company = await prisma.company.create({
            data: {
                ...parsed.data,
                currencyId: currency.id,
                users: {
                    create: {
                        fullName: parsed.data.users[0].fullName,
                        email: parsed.data.users[0].email,
                        password: hashedPassword,
                        role: UserRole.ADMIN,
                    },
                },
            },
            include: { users: true },
        });

        return { success: true, company, message: "Empresa creada exitosamente." };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error interno del servidor', };
    }
}


export interface PayloadData {
    sub: number;
    userEmail: string;
    companyId: number;
    currency: {
        id: number;
        value: string;
    };
}

export interface ResAuthMe {
    id: number;
    email: string;
    companyId: number;
    currency: {
        id: number;
        value: string;
    };
}

export interface ResVerify extends PayloadData {
    iat: number;
    exp: number
}

export async function verifyToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        throw new Error("No autorizado - token no encontrado. Válida tu sesión nuevamente");
    }

    try {
        const { payload } = await jwtVerify(token, secret)

        return payload as unknown as PayloadData;
    } catch {
        throw new Error("No autorizado - token inválido");
    }

}

export async function getUserFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) throw new Error("No autorizado - token no encontrado");

    const { payload } = await jwtVerify(token, secret);

    return payload as { sub: string; companyId: number; email: string };
}

export async function authMe() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return { success: false, message: "No autorizado - token no encontrado", data: null };
    }

    try {
        const { payload } = await jwtVerify(token, secret) as unknown as { payload: PayloadData };

        return {
            success: true,
            message: "Datos obtenidos",
            data: {
                id: payload.sub,
                email: payload.userEmail,
                companyId: payload.companyId,
                currency: payload.currency,
            }
        };
    } catch {
        return { success: false, message: "No autorizado - token inválido", data: null };
    }
}


export async function logOut() {
    const cookieStore = await cookies();

    cookieStore.delete("access_token")

    redirect("/auth/login");
}