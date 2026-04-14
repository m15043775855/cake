package com.example.cake.controller;

import com.example.cake.dto.ApiResponse;
import com.example.cake.dto.RevisitTaskDetail;
import com.example.cake.entity.Order;
import com.example.cake.entity.RevisitTask;
import com.example.cake.service.OrderService;
import com.example.cake.service.RevisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/revisits")
public class RevisitController {

    private final RevisitService revisitService;
    private final OrderService orderService;

    @Autowired
    public RevisitController(RevisitService revisitService, OrderService orderService) {
        this.revisitService = revisitService;
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RevisitTask>>> listTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer withinDays) {
        Page<RevisitTask> tasks = revisitService.listTasks(page, size, status, withinDays);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RevisitTaskDetail>> getTask(@PathVariable Long id) {
        RevisitTask task = revisitService.getTask(id);
        Order order = orderService.getOrder(task.getOrderId());
        RevisitTaskDetail detail = new RevisitTaskDetail(task, order);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<RevisitTask>> completeTask(@PathVariable Long id) {
        RevisitTask task = revisitService.completeTask(id);
        return ResponseEntity.ok(ApiResponse.success(task));
    }
}
