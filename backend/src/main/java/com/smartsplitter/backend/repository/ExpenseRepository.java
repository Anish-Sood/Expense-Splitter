// CORRECT
package com.smartsplitter.backend.repository;

import com.smartsplitter.backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @Query("SELECT e FROM Expense e " +
            "LEFT JOIN FETCH e.paidBy " +
            "LEFT JOIN FETCH e.splits s " +
            "LEFT JOIN FETCH s.user " +
            "WHERE e.group.id = :groupId ORDER BY e.date DESC")
    List<Expense> findByGroupIdWithDetails(@Param("groupId") Long groupId);
    List<Expense> findByGroup_IdOrderByDateDesc(Long groupId);
    @Query("SELECT e FROM Expense e " +
            "LEFT JOIN FETCH e.paidBy " +
            "LEFT JOIN FETCH e.splits s " +
            "LEFT JOIN FETCH s.user " +
            "WHERE e.id = :expenseId")
    Optional<Expense> findByIdWithDetails(@Param("expenseId") Long expenseId);

}