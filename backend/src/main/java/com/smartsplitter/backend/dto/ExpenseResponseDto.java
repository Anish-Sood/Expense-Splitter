package com.smartsplitter.backend.dto;

import com.smartsplitter.backend.entity.ExpenseCategory;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExpenseResponseDto {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDateTime date;
    private ExpenseCategory category;
    private Long paidByUserId;
    private String paidByUserName;
    private Long groupId;
    private List<ExpenseSplitResponseDto> splits;
}