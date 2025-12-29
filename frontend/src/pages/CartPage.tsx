import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '../hooks/useApi';
import { useCartStore } from '../store/cartStore';

export default function CartPage() {
    const { data: cart, isLoading } = useCart();
    const updateMutation = useUpdateCartItem();
    const removeMutation = useRemoveFromCart();
    const clearMutation = useClearCart();
    const { setItems } = useCartStore();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="mb-8">Add some products to get started!</p>
                <a href="/products" className="btn btn-primary">
                    Browse Products
                </a>
            </div>
        );
    }

    const totalPrice = cart.items.reduce((total: number, item: any) => {
        return total + item.variantId.sellingPrice * item.qty;
    }, 0);

    const handleUpdateQty = async (variantId: string, qty: number) => {
        try {
            await updateMutation.mutateAsync({ variantId, qty });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update quantity');
        }
    };

    const handleRemove = async (variantId: string) => {
        try {
            await removeMutation.mutateAsync(variantId);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to remove item');
        }
    };

    const handleClear = async () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            try {
                await clearMutation.mutateAsync();
            } catch (error: any) {
                alert(error.response?.data?.message || 'Failed to clear cart');
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Shopping Cart</h1>
                <button onClick={handleClear} className="btn btn-error btn-outline btn-sm">
                    Clear Cart
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.items.map((item: any) => (
                        <div key={item.variantId._id} className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="flex gap-4">
                                    <img
                                        src={
                                            item.variantId.productId.images?.[0] ||
                                            'https://via.placeholder.com/100'
                                        }
                                        alt={item.variantId.productId.title}
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold">{item.variantId.productId.title}</h3>
                                        <p className="text-sm text-base-content/70">
                                            SKU: {item.variantId.sku}
                                        </p>
                                        <p className="text-sm text-base-content/70">
                                            {Object.entries(item.variantId.attributes).map(
                                                ([key, value]: any) => `${key}: ${value}`
                                            ).join(', ')}
                                        </p>
                                        <p className="font-semibold mt-2">
                                            ${item.variantId.sellingPrice.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-2 items-center">
                                            <button
                                                className="btn btn-sm"
                                                onClick={() =>
                                                    handleUpdateQty(item.variantId._id, Math.max(1, item.qty - 1))
                                                }
                                                disabled={item.qty === 1}
                                            >
                                                -
                                            </button>
                                            <span className="font-semibold">{item.qty}</span>
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => handleUpdateQty(item.variantId._id, item.qty + 1)}
                                                disabled={item.qty >= item.variantId.availableQty}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.variantId._id)}
                                            className="btn btn-sm btn-error btn-outline"
                                        >
                                            Remove
                                        </button>
                                        <p className="font-bold">
                                            ${(item.variantId.sellingPrice * item.qty).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="card bg-base-100 shadow-xl sticky top-4">
                        <div className="card-body">
                            <h2 className="card-title">Order Summary</h2>
                            <div className="divider"></div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-semibold">Calculated at checkout</span>
                                </div>
                                <div className="divider"></div>
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            <button className="btn btn-primary w-full mt-4">
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
