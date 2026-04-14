package com.example.cake.service;

import com.example.cake.dto.OrderCreateRequest;
import com.example.cake.dto.OrderUpdateRequest;
import com.example.cake.entity.Order;
import org.springframework.data.domain.Page;

public interface OrderService {

    Order createOrder(OrderCreateRequest request);

    Page<Order> listOrders(int page, int size, String keyword);

    Order getOrder(Long id);

    Order updateOrder(Long id, OrderUpdateRequest request);

    void deleteOrder(Long id);
}
