import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Products
export const useProducts = (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            const { data } = await api.get('/products', { params });
            return data.data;
        },
    });
};

export const useProduct = (id: string) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const { data } = await api.get(`/products/${id}`);
            return data.data.product;
        },
        enabled: !!id,
    });
};

// Variants
export const useVariants = (productId?: string) => {
    return useQuery({
        queryKey: ['variants', productId],
        queryFn: async () => {
            const { data } = await api.get('/variants', {
                params: productId ? { productId } : undefined,
            });
            return data.data.variants;
        },
    });
};

export const useVariant = (id: string) => {
    return useQuery({
        queryKey: ['variant', id],
        queryFn: async () => {
            const { data } = await api.get(`/variants/${id}`);
            return data.data.variant;
        },
        enabled: !!id,
    });
};

// Cart
export const useCart = () => {
    return useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const { data } = await api.get('/cart');
            return data.data.cart;
        },
    });
};

export const useAddToCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (item: { variantId: string; qty: number }) => {
            const { data } = await api.post('/cart/items', item);
            return data.data.cart;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
};

export const useUpdateCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            variantId,
            qty,
        }: {
            variantId: string;
            qty: number;
        }) => {
            const { data } = await api.put(`/cart/items/${variantId}`, { qty });
            return data.data.cart;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
};

export const useRemoveFromCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (variantId: string) => {
            const { data } = await api.delete(`/cart/items/${variantId}`);
            return data.data.cart;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
};

export const useClearCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { data } = await api.delete('/cart');
            return data.data.cart;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
};
