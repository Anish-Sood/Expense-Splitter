package com.smartsplitter.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BalanceDto {
    private Long userId;
    private String userName;
    private BigDecimal netBalance;
}