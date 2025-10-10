package com.smartsplitter.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ExpenseSplitResponseDto {
    private Long userId;
    private String userName;
    private BigDecimal amountOwed;
}