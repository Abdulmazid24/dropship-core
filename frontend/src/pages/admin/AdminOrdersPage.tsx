import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function AdminOrdersPage() {
    const [statusFilter, setStatusFilter] = useState('');

    const { data: orders, isLoading } = useQuery({
        queryKey: ['admin-orders', statusFilter],
        queryFn: async () => {
            // For now, we'll use the regular orders endpoint
            // In production, you'd have an admin-specific endpoint with all orders
            const { data } = await api.get('/orders');
            return data.data.orders;
        },
    });

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, {
                orderStatus: newStatus,
            });
            // Refresh orders
            window.location.reload();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Order Management</h1>
                <select
                    className="select select-bordered"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Total</th>
                            <th>Payment Status</th>
                            <th>Order Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders?.map((order: any) => (
                            <tr key={order._id}>
                                <td className="font-mono text-sm">{order._id.slice(-8)}</td>
                                <td className="font-semibold">${order.totalAmount.toFixed(2)}</td>
                                <td>
                                    <span
                                        className={`badge ${order.paymentStatus === 'PAID'
                                                ? 'badge-success'
                                                : order.paymentStatus === 'PENDING'
                                                    ? 'badge-warning'
                                                    : 'badge-error'
                                            }`}
                                    >
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        className="select select-sm select-bordered"
                                        value={order.orderStatus}
                                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PROCESSING">Processing</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn btn-ghost btn-sm">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(!orders || orders.length === 0) && (
                <div className="text-center py-12">
                    <p className="text-lg text-base-content/70">No orders found</p>
                </div>
            )}
        </div>
    );
}
