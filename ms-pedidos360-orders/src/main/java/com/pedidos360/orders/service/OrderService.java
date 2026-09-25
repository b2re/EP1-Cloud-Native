package com.pedidos360.orders.service;

import com.pedidos360.orders.client.CatalogClient;
import com.pedidos360.orders.model.Order;
import com.pedidos360.orders.model.Order.OrderStatus;
import com.pedidos360.orders.repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CatalogClient catalogClient;

    public OrderService(OrderRepository orderRepository, CatalogClient catalogClient) {
        this.orderRepository = orderRepository;
        this.catalogClient = catalogClient;
    }

    // Obtener todos los pedidos
    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    // Obtener pedido por ID
    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    // Obtener los pedidos de un cliente
    public List<Order> findByCustomerId(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    // Crear pedido: siempre nace en estado CREADO y el producto debe existir
    public Order create(Order order) {
        catalogClient.assertProductExists(order.getProductId());

        order.setId(null);
        order.setStatus(OrderStatus.CREADO);
        order.setCreatedAt(null);

        return orderRepository.save(order);
    }

    // Actualizar producto/cantidad: solo mientras el pedido no ha sido aceptado
    public Order update(Long id, Long productId, Integer quantity) {
        Order order = findById(id);

        if (order.getStatus() != OrderStatus.CREADO) {
            throw new IllegalStateException(
                    "Solo se puede modificar un pedido en estado CREADO (estado actual: "
                            + order.getStatus() + ")"
            );
        }

        catalogClient.assertProductExists(productId);

        order.setProductId(productId);
        order.setQuantity(quantity);

        return orderRepository.save(order);
    }

    // Eliminar pedido
    public void deleteById(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Pedido no encontrado");
        }

        orderRepository.deleteById(id);
    }

    // Cambiar estado del pedido
    public Order changeStatus(Long id, OrderStatus newStatus) {

        Order order = findById(id);
        OrderStatus currentStatus = order.getStatus();

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new IllegalStateException(
                    "Cambio de estado no permitido: "
                            + currentStatus
                            + " -> "
                            + newStatus
            );
        }

        // Regla de negocio: el stock disminuye al aceptar el pedido
        if (newStatus == OrderStatus.ACEPTADO) {
            catalogClient.decreaseStock(order.getProductId(), order.getQuantity());
        }

        order.setStatus(newStatus);

        return orderRepository.save(order);
    }

    // Validar secuencia de estados
    private boolean isValidTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus
    ) {

        if (currentStatus == OrderStatus.CREADO) {
            return newStatus == OrderStatus.ACEPTADO
                    || newStatus == OrderStatus.CANCELADO;
        }

        if (currentStatus == OrderStatus.ACEPTADO) {
            return newStatus == OrderStatus.EN_PREPARACION
                    || newStatus == OrderStatus.CANCELADO;
        }

        if (currentStatus == OrderStatus.EN_PREPARACION) {
            return newStatus == OrderStatus.DESPACHADO
                    || newStatus == OrderStatus.CANCELADO;
        }

        if (currentStatus == OrderStatus.DESPACHADO) {
            return newStatus == OrderStatus.ENTREGADO
                    || newStatus == OrderStatus.CANCELADO;
        }

        return false;
    }
}
