package com.example.cake.service;

import com.example.cake.entity.Order;
import com.example.cake.entity.RevisitTask;
import org.springframework.data.domain.Page;

public interface RevisitService {

    void createRevisitTask(Order order);

    Page<RevisitTask> listTasks(int page, int size, String status);

    Page<RevisitTask> listTasks(int page, int size, String status, Integer withinDays);

    RevisitTask getTask(Long id);

    RevisitTask completeTask(Long id);
}
