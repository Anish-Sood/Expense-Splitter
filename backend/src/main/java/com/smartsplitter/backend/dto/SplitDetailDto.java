package com.smartsplitter.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SplitDetailDto {
    private Long userId;
    private BigDecimal value;
}