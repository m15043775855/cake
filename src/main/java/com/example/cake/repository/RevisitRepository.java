package com.example.cake.repository;

import com.example.cake.entity.RevisitTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface RevisitRepository extends JpaRepository<RevisitTask, Long> {

    Page<RevisitTask> findByStatus(String status, Pageable pageable);

    @Query("SELECT t FROM RevisitTask t WHERE t.revisitDate <= :targetDate")
    Page<RevisitTask> findByRevisitDateBefore(@Param("targetDate") LocalDate targetDate, Pageable pageable);

    @Query("SELECT t FROM RevisitTask t WHERE t.revisitDate <= :targetDate AND t.status = :status")
    Page<RevisitTask> findByRevisitDateBeforeAndStatus(@Param("targetDate") LocalDate targetDate, @Param("status") String status, Pageable pageable);
}
