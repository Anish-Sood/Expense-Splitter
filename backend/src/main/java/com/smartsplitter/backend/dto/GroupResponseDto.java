package com.smartsplitter.backend.dto;

import lombok.Data;
import java.util.Set;

@Data
public class GroupResponseDto {
    private Long id;
    private String name;
    private Long createdByUserId;
    private Set<Long> memberIds;
}