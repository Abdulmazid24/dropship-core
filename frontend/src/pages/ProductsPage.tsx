import { useState } from 'react';
import { useProducts } from '../hooks/useApi';
import { Link } from 'react-router-dom';

export default function ProductsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data, isLoading, error } = useProducts({ page, limit: 12, search });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <span>Error loading products. Please try again.</span>
            </div>
        );
    }

    const { products, pagination } = data || { products: [], pagination: {} };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Products</h1>

                {/* Search */}
                <div className="form-control">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="input input-bordered w-full max-w-xs"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product: any) => (
                    <Link
                        key={product._id}
                        to={`/products/${product._id}`}
                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
                    >
                        <figure className="px-4 pt-4">
                            <img
                                src={product.images?.[0] || 'https://via.placeholder.com/300'}
                                alt={product.title}
                                className="rounded-xl h-48 w-full object-cover"
                            />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title text-sm">{product.title}</h2>
                            <p className="text-xs text-base-content/70 line-clamp-2">
                                {product.description}
                            </p>
                            <div className="card-actions justify-end mt-2">
                                <button className="btn btn-primary btn-sm">View Details</button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="join">
                        <button
                            className="join-item btn"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            «
                        </button>
                        <button className="join-item btn">
                            Page {page} of {pagination.pages}
                        </button>
                        <button
                            className="join-item btn"
                            disabled={page === pagination.pages}
                            onClick={() => setPage(page + 1)}
                        >
                            »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
