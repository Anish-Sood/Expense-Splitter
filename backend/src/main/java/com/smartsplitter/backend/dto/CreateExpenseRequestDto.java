package com.smartsplitter.backend.dto;

import com.smartsplitter.backend.entity.ExpenseCategory;
import com.smartsplitter.backend.entity.SplitType;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateExpenseRequestDto {
    private String description;
    private BigDecimal amount;
    private Long groupId;
    private ExpenseCategory category;
    private SplitType splitType;
    private List<SplitDetailDto> splits; // For BY_AMOUNT and BY_PERCENTAGE
}