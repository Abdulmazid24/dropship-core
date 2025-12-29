import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useProduct, useVariants, useAddToCart } from '../hooks/useApi';
import { useCartStore } from '../store/cartStore';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [selectedVariant, setSelectedVariant] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    const { data: product, isLoading: loadingProduct } = useProduct(id!);
    const { data: variants, isLoading: loadingVariants } = useVariants(id);
    const addToCartMutation = useAddToCart();
    const { openCart } = useCartStore();

    if (loadingProduct || loadingVariants) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="alert alert-error">
                <span>Product not found</span>
            </div>
        );
    }

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            alert('Please select a variant');
            return;
        }

        try {
            await addToCartMutation.mutateAsync({
                variantId: selectedVariant,
                qty: quantity,
            });
            openCart();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    const selectedVariantData = variants?.find(
        (v: any) => v._id === selectedVariant
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div>
                    <img
                        src={product.images?.[0] || 'https://via.placeholder.com/500'}
                        alt={product.title}
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
                    <p className="text-base-content/70 mb-6">{product.description}</p>

                    {/* Variants */}
                    {variants && variants.length > 0 && (
                        <div className="mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">Select Variant</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={selectedVariant}
                                onChange={(e) => setSelectedVariant(e.target.value)}
                            >
                                <option value="">Choose a variant...</option>
                                {variants.map((variant: any) => (
                                    <option key={variant._id} value={variant._id}>
                                        {variant.sku} - {variant.attributes.color || ''}{' '}
                                        {variant.attributes.size || ''} - $
                                        {variant.sellingPrice.toFixed(2)}
                                        {variant.availableQty > 0
                                            ? ` (${variant.availableQty} in stock)`
                                            : ' (Out of stock)'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Price */}
                    {selectedVariantData && (
                        <div className="mb-6">
                            <p className="text-3xl font-bold text-primary">
                                ${selectedVariantData.sellingPrice.toFixed(2)}
                            </p>
                            {selectedVariantData.profitMargin > 0 && (
                                <p className="text-sm text-success">
                                    Profit: ${selectedVariantData.profitMargin.toFixed(2)} (
                                    {selectedVariantData.profitPercentage.toFixed(1)}%)
                                </p>
                            )}
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="mb-6">
                        <label className="label">
                            <span className="label-text font-semibold">Quantity</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={selectedVariantData?.availableQty || 1}
                            className="input input-bordered w-24"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        />
                    </div>

                    {/* Add to Cart */}
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleAddToCart}
                        disabled={
                            !selectedVariant ||
                            selectedVariantData?.availableQty === 0 ||
                            addToCartMutation.isPending
                        }
                    >
                        {addToCartMutation.isPending ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            'Add to Cart'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
