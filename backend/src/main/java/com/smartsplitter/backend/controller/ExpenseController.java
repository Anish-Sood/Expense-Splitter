package com.smartsplitter.backend.controller;

import com.smartsplitter.backend.dto.CreateExpenseRequestDto;
import com.smartsplitter.backend.dto.ExpenseResponseDto;
import com.smartsplitter.backend.dto.ExpenseSplitResponseDto;
import com.smartsplitter.backend.entity.Expense;
import com.smartsplitter.backend.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.smartsplitter.backend.repository.ExpenseRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

import java.util.stream.Collectors;
import com.smartsplitter.backend.dto.SpendingByCategoryDto;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ExpenseRepository expenseRepository;

    @Autowired
    public ExpenseController(ExpenseService expenseService, ExpenseRepository expenseRepository) {
        this.expenseService = expenseService;
        this.expenseRepository = expenseRepository;

    }

    @PostMapping
    public ResponseEntity<ExpenseResponseDto> createExpense(@RequestBody CreateExpenseRequestDto requestDto) {
        try {
            Expense newExpense = expenseService.createExpense(requestDto);
            return ResponseEntity.ok(convertToDto(newExpense));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null); 
        }
    }

    private ExpenseResponseDto convertToDto(Expense expense) {
        ExpenseResponseDto dto = new ExpenseResponseDto();
        dto.setId(expense.getId());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount());
        dto.setDate(expense.getDate());
        dto.setCategory(expense.getCategory());
        dto.setGroupId(expense.getGroup().getId());
        dto.setPaidByUserId(expense.getPaidBy().getId());
        dto.setPaidByUserName(expense.getPaidBy().getName());

        dto.setSplits(expense.getSplits().stream().map(split -> {
            ExpenseSplitResponseDto splitDto = new ExpenseSplitResponseDto();
            splitDto.setUserId(split.getUser().getId());
            splitDto.setUserName(split.getUser().getName());
            splitDto.setAmountOwed(split.getAmountOwed());
            return splitDto;
        }).collect(Collectors.toList()));

        return dto;
    }
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<ExpenseResponseDto>> getExpensesForGroup(@PathVariable Long groupId) {

        List<Expense> expenses = expenseRepository.findByGroupIdWithDetails(groupId);

        List<ExpenseResponseDto> expenseDtos = expenses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(expenseDtos);
    }
    @GetMapping("/group/{groupId}/insights/by-category")
    public ResponseEntity<List<SpendingByCategoryDto>> getSpendingByCategory(@PathVariable Long groupId) {
        
        List<SpendingByCategoryDto> spendingData = expenseService.getSpendingByCategory(groupId);
        return ResponseEntity.ok(spendingData);
    }
    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long expenseId) {
        try {
            expenseService.deleteExpense(expenseId);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponseDto> editExpense(
            @PathVariable Long expenseId,
            @RequestBody CreateExpenseRequestDto requestDto) {
        try {
            Expense editedExpense = expenseService.editExpense(expenseId, requestDto);
            return ResponseEntity.ok(convertToDto(editedExpense));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}