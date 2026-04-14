package com.example.cake.repository;

import com.example.cake.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o WHERE o.deleted = false AND (o.customerName LIKE %:keyword% OR o.phone LIKE %:keyword%)")
    Page<Order> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Page<Order> findByDeletedFalse(Pageable pageable);
}
