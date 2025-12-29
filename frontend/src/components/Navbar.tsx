import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { getTotalItems } = useCartStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="navbar bg-base-100 shadow-lg">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-xl">
                    DropShip Core
                </Link>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li>
                        <Link to="/products">Products</Link>
                    </li>
                    {isAuthenticated && user?.role === 'ADMIN' && (
                        <li>
                            <Link to="/admin">Admin</Link>
                        </li>
                    )}
                    {isAuthenticated ? (
                        <>
                            <li>
                                <Link to="/cart" className="indicator">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    {getTotalItems() > 0 && (
                                        <span className="badge badge-sm indicator-item">
                                            {getTotalItems()}
                                        </span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <details>
                                    <summary>{user?.name}</summary>
                                    <ul className="p-2 bg-base-100 z-10">
                                        <li>
                                            <Link to="/orders">My Orders</Link>
                                        </li>
                                        <li>
                                            <button onClick={handleLogout}>Logout</button>
                                        </li>
                                    </ul>
                                </details>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                            <li>
                                <Link to="/signup">Sign Up</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
}
