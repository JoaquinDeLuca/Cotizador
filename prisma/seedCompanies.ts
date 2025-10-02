import { Country, PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const countryToCurrencyMap = {
    [Country.ARGENTINA]: 'ARS',
}

async function main() {
    const companiesToSeed = [
        {
            companyName: 'Fer Corp',
            businessIdentifier: '323232-1',
            country: Country.ARGENTINA,
            email: 'fer@corp.com',
            cuit: '29-239212-1',
            phone: '+553232323',
            users: [
                {
                    fullName: 'Pedro Paz',
                    email: 'pedro@corp.com',
                    password: "Test1234",
                    role: UserRole.ADMIN
                },
            ],
        },
        {
            companyName: 'Globex S.A.',
            businessIdentifier: '88299321-0',
            country: Country.ARGENTINA,
            email: 'sa@globex.com',
            cuit: '23-232312-2',
            phone: '555-4321',
            users: [
                {
                    fullName: 'Carlos Gómez',
                    email: 'carlos@globex.com',
                    password: "Test1234",
                    role: UserRole.ADMIN
                },
            ],
        },
    ]

    for (const companyData of companiesToSeed) {
        const currencyValue = countryToCurrencyMap[companyData.country]
        const currency = await prisma.currency.findFirst({
            where: { value: currencyValue },
        })

        if (!currency) {
            throw new Error(`Currency "${currencyValue}" no encontrada.`)
        }


        const hashedPassword = await bcrypt.hash(companyData.users[0].password, 10);

        await prisma.company.create({
            data: {
                companyName: companyData.companyName,
                businessIdentifier: companyData.businessIdentifier,
                country: companyData.country,
                email: companyData.email,
                cuit: companyData.cuit,
                phone: companyData.phone,
                currency: {
                    connect: { id: currency.id },
                },
                users: {
                    create: {
                        email: companyData.users[0].email,
                        fullName: companyData.users[0].fullName,
                        password: hashedPassword,
                        role: companyData.users[0].role
                    },
                },
            },
        })
    }
}

main()
    .then(() => {
        console.log('Seed completado!')
    })
    .catch((e) => {
        console.error('Error durante seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
