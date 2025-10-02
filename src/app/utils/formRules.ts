// Reglas que se usan en todos los formularios

export const requiredRule = {
    required: true,
    message: "Campo obligatorio",
} as const;

export const emailRule = {
    type: "email",
    message: "El correo no es válido",
} as const;

export const phoneRule = {
    pattern: /^\+?[0-9\s\-()]{7,15}$/,
    message: "El número de teléfono no es válido",
} as const;


export const passwordRule = {
    pattern: /^(?=.*[A-Z])(?=.*\d).{6,}$/,
    message: "La contraseña debe tener al menos 6 caracteres, 1 mayúscula y 1 número",
} as const;