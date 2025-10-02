import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Monedas
    const currencies = [
        { value: 'ARS' }, // Peso ARG
        { value: 'USD' }, // Dolar
    ]

    for (const currency of currencies) {
        await prisma.currency.upsert({
            where: { value: currency.value },
            update: {},
            create: currency,
        })
    }

    // Categorias de productos, agregar las necesarias
    const categories = [
        { name: 'Electrónica', description: 'Dispositivos electrónicos, gadgets y tecnología en general' },
        { name: 'Ropa', description: 'Prendas de vestir, moda y accesorios' },
        { name: 'Hogar', description: 'Productos para el hogar, cocina y decoración' },
        { name: 'Servicios', description: 'Servicios generales de cualquier tipo' },
        { name: 'Alimentos', description: 'Comida, bebidas y productos de supermercado' },
        { name: 'Salud y Belleza', description: 'Productos de cuidado personal, cosmética y bienestar' },
        { name: 'Deportes y Ocio', description: 'Artículos deportivos, juegos, hobbies y entretenimiento' },
        { name: 'Automotriz', description: 'Vehículos, repuestos y accesorios relacionados' }
    ]

    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        })
    }

    console.log('Monedas - categorías seed completado.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
