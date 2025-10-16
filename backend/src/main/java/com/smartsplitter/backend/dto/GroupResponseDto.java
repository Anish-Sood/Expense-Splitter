package com.smartsplitter.backend.dto;

import lombok.Data;
import java.util.Set;
import java.util.stream.Collectors; 


@Data
public class GroupResponseDto {
    private Long id;
    private String name;
    private Long createdByUserId;
    private Set<MemberDto> members;
}