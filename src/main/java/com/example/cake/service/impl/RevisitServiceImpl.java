package com.example.cake.service.impl;

import com.example.cake.entity.Order;
import com.example.cake.entity.RevisitTask;
import com.example.cake.exception.ResourceNotFoundException;
import com.example.cake.repository.RevisitRepository;
import com.example.cake.service.RevisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class RevisitServiceImpl implements RevisitService {

    private final RevisitRepository revisitRepository;

    @Autowired
    public RevisitServiceImpl(RevisitRepository revisitRepository) {
        this.revisitRepository = revisitRepository;
    }

    @Override
    @Transactional
    public void createRevisitTask(Order order) {
        if (Boolean.TRUE.equals(order.getDeleted())) {
            return;
        }

        RevisitTask task = new RevisitTask();
        task.setOrderId(order.getId());
        task.setCustomerName(order.getCustomerName());
        task.setPhone(order.getPhone());
        task.setOriginalOrderDate(order.getOrderDate());
        task.setRevisitDate(order.getOrderDate().plusYears(1));
        revisitRepository.save(task);
    }

    @Override
    public Page<RevisitTask> listTasks(int page, int size, String status) {
        return listTasks(page, size, status, null);
    }

    @Override
    public Page<RevisitTask> listTasks(int page, int size, String status, Integer withinDays) {
        Pageable pageable = PageRequest.of(page, size);
        boolean hasStatus = status != null && !status.trim().isEmpty();
        boolean hasDays = withinDays != null && withinDays > 0;

        if (hasDays) {
            LocalDate targetDate = LocalDate.now().plusDays(withinDays);
            if (hasStatus) {
                return revisitRepository.findByRevisitDateBeforeAndStatus(targetDate, status.trim(), pageable);
            }
            return revisitRepository.findByRevisitDateBefore(targetDate, pageable);
        }

        if (hasStatus) {
            return revisitRepository.findByStatus(status.trim(), pageable);
        }
        return revisitRepository.findAll(pageable);
    }

    @Override
    public RevisitTask getTask(Long id) {
        return revisitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RevisitTask", id));
    }

    @Override
    @Transactional
    public RevisitTask completeTask(Long id) {
        RevisitTask task = revisitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RevisitTask", id));

        if ("PENDING".equals(task.getStatus())) {
            task.setStatus("COMPLETED");
            task.setCompletedAt(LocalDateTime.now());
            return revisitRepository.save(task);
        }

        return task;
    }
}
