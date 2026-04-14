package com.example.cake.dto;

import com.example.cake.entity.Order;
import com.example.cake.entity.RevisitTask;

public class RevisitTaskDetail {

    private RevisitTask revisitTask;
    private Order order;

    public RevisitTaskDetail() {
    }

    public RevisitTaskDetail(RevisitTask revisitTask, Order order) {
        this.revisitTask = revisitTask;
        this.order = order;
    }

    public RevisitTask getRevisitTask() {
        return revisitTask;
    }

    public void setRevisitTask(RevisitTask revisitTask) {
        this.revisitTask = revisitTask;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }
}
