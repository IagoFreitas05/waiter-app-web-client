import {useState} from 'react';
import {Order} from '../../types/Order';
import {OrderModal} from '../OrderModal';
import {Board, OrdersContainer} from './style';
import {api} from '../../utils/api.ts';
import {toast} from 'react-toastify';

interface OrdersBoardProps {
    icon: string;
    title: string;
    orders: Order[];
    onCancelOrder: (orderId: string) => void;
    onChangeOrderStatus: (orderId: string, status: Order["status"]) =>  void;
}

export function OrdersBoard({icon, title, orders, onCancelOrder, onChangeOrderStatus}: OrdersBoardProps) {
    const [isModalVisibile, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    function handleCloseModal() {
        setIsModalVisible(false);
        setSelectedOrder(null);
    }

    function handleOpenModal(order: Order) {
        setIsModalVisible(true);
        setSelectedOrder(order);
    }

    async function handleCancelOrder() {
        setIsLoading(true)
        if(!selectedOrder){
            return null;
        }
        await api.delete(`/orders/${selectedOrder._id}`);
        toast.success(`O pedido da mesa ${selectedOrder.table} foi cancelado`);
        onCancelOrder(selectedOrder._id);
        setIsLoading(false);
        setIsModalVisible(false);
    }

    async function handleChangeOrderStatus(){
        if(!selectedOrder){
            return null;
        }
        const status = selectedOrder.status === "WAITING" ? "IN_PRODUCTION" : "DONE";
        setIsLoading(true);

        await api.patch(`/orders/${selectedOrder._id}`, {status});
        toast.success(`O pedido da mesa ${selectedOrder.table} teve o status alterado`);
        onChangeOrderStatus(selectedOrder._id, status);
        setIsLoading(false);
        setIsModalVisible(false);
    }

    return (
        <Board>
            <OrderModal
                onChangeOrderStatus={handleChangeOrderStatus}
                onCancelOrder={handleCancelOrder}
                visible={isModalVisibile}
                order={selectedOrder}
                onClose={handleCloseModal}
                isLoading={isLoading}
            />
            <header>
                <span>{icon}</span>
                <strong>{title}</strong>
                <span>{orders.length}</span>
            </header>
            {orders.length > 0 && (
                <OrdersContainer>
                    {orders.map((order) => (
                        <button
                            type="button"
                            key={order._id}
                            onClick={() => handleOpenModal(order)}>
                            <strong>Mesa {order.table}</strong>
                            <span>{order.products.length} itens</span>
                        </button>
                    ))}
                </OrdersContainer>
            )}
        </Board>
    );
}
