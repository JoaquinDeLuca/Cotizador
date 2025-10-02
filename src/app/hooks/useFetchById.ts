import { useEffect, useState } from "react";

export function useFetchById<T>({
    id,
    fetchFn
}: {
    id: number | undefined | null,
    fetchFn: (id: number) => Promise<{ success: boolean; data?: T }>
}) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        let isMounted = true;
        setLoading(true);

        (async () => {
            const response = await fetchFn(id);
            if (isMounted && response.success && response.data) {
                setData(response.data);
            }
            setLoading(false);
        })();

        return () => {
            isMounted = false;
        };
    }, [id, fetchFn]);

    return { data, loading };
}
