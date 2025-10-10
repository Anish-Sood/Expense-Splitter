package com.smartsplitter.backend.dto;

import com.smartsplitter.backend.entity.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SpendingByCategoryDto {
    private ExpenseCategory name;
    private BigDecimal amount;
}