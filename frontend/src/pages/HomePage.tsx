export default function HomePage() {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Welcome to Dropship Core</h1>
                    <p className="py-6">
                        Your comprehensive dropshipping eCommerce platform. Browse products, manage inventory, and grow your business.
                    </p>
                    <a href="/products" className="btn btn-primary">
                        Browse Products
                    </a>
                </div>
            </div>
        </div>
    );
}
