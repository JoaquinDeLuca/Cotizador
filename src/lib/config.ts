/* eslint-disable prefer-const */
interface Config {
    DATABASE_URL: string
    JWT_SECRET: string
}

interface SecretsFromAWS {
    DATABASE_URL: string
    JWT_SECRET: string
}

export function getConfig(): Config {
    if (process.env.APP_SECRETS && process.env.NODE_ENV === 'production') {
        try {
            const secrets: SecretsFromAWS = JSON.parse(process.env.APP_SECRETS)
            return {
                DATABASE_URL: secrets.DATABASE_URL,
                JWT_SECRET: secrets.JWT_SECRET,
            }
        } catch (error) {
            console.error('Error al parsear APP_SECRETS:', error)
            throw new Error('Error al parsear aws secrets')
        }
    }

    // Desarrollo local
    return {
        DATABASE_URL: process.env.DATABASE_URL!,
        JWT_SECRET: process.env.JWT_SECRET!,
    }
}

// Exportar config validado
export let config: Config = getConfig();