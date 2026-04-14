package com.example.cake.service.impl;

import com.example.cake.dto.OrderCreateRequest;
import com.example.cake.dto.OrderUpdateRequest;
import com.example.cake.entity.Order;
import com.example.cake.exception.ResourceNotFoundException;
import com.example.cake.repository.OrderRepository;
import com.example.cake.service.OrderService;
import com.example.cake.service.RevisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final RevisitService revisitService;

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, RevisitService revisitService) {
        this.orderRepository = orderRepository;
        this.revisitService = revisitService;
    }

    @Override
    @Transactional
    public Order createOrder(OrderCreateRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setCakeType(request.getCakeType());
        order.setOrderDate(request.getOrderDate());
        order.setPrice(request.getPrice());
        order.setAddress(request.getAddress());
        order.setRemark(request.getRemark());

        Order savedOrder = orderRepository.save(order);
        revisitService.createRevisitTask(savedOrder);
        return savedOrder;
    }

    @Override
    public Page<Order> listOrders(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        if (keyword != null && !keyword.trim().isEmpty()) {
            return orderRepository.searchByKeyword(keyword.trim(), pageable);
        }
        return orderRepository.findByDeletedFalse(pageable);
    }

    @Override
    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    @Override
    @Transactional
    public Order updateOrder(Long id, OrderUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setCakeType(request.getCakeType());
        order.setOrderDate(request.getOrderDate());
        order.setPrice(request.getPrice());
        order.setAddress(request.getAddress());
        order.setRemark(request.getRemark());

        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setDeleted(true);
        orderRepository.save(order);
    }

}
