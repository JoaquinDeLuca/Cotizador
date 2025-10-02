import { useState } from "react";
import type { CreateQuoteItemDto, EditQuoteItemDto } from "@/schemas/quote/quote.dto";

// tomo los DTO de zod (manejar create y edit)
type QuoteItemsType = CreateQuoteItemDto | EditQuoteItemDto;


export function useCart(data: QuoteItemsType[], isEdit: boolean) {
    const [items, setItems] = useState<QuoteItemsType[]>(isEdit ? data : []);

    const addProduct = (productId: number) => {
        setItems((prevItems) => {
            const exists = prevItems.find((item) => item.productId === productId);

            if (exists) {
                return prevItems.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                const productFound = data.find(
                    (product) => product.productId === productId
                );

                if (!productFound) return prevItems;

                return [
                    ...prevItems,
                    {
                        productName: productFound.productName,
                        productId: Number(productId),
                        quantity: 1,
                        unitPrice: Number(productFound.unitPrice),
                        sku: productFound.sku,
                    },
                ];
            }
        });
    };

    const updateItem = (
        productId: number,
        key: "quantity" | "unitPrice",
        value: number
    ) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.productId === productId ? { ...item, [key]: value } : item
            )
        );
    };

    const removeItem = (productId: number) => {
        setItems((prevItems) =>
            prevItems.filter((item) => item.productId !== productId)
        );
    };

    return {
        items,
        addProduct,
        updateItem,
        removeItem,
    };
}
