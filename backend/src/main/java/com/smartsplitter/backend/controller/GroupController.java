package com.smartsplitter.backend.controller;

import com.smartsplitter.backend.dto.CreateGroupRequestDto;
import com.smartsplitter.backend.dto.GroupResponseDto;
import com.smartsplitter.backend.dto.MemberDto;
import com.smartsplitter.backend.entity.Group;
import com.smartsplitter.backend.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.smartsplitter.backend.repository.GroupRepository; 
import com.smartsplitter.backend.entity.User;
import com.smartsplitter.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import com.smartsplitter.backend.dto.AddMemberRequestDto;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Autowired
    public GroupController(GroupService groupService, GroupRepository groupRepository, UserRepository userRepository) {
        this.groupService = groupService;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<GroupResponseDto> createGroup(@RequestBody CreateGroupRequestDto createGroupRequestDto) {
        Group createdGroup = groupService.createGroup(createGroupRequestDto.getName());
        return ResponseEntity.ok(convertToDto(createdGroup));
    }

    private GroupResponseDto convertToDto(Group group) {
        GroupResponseDto dto = new GroupResponseDto();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setCreatedByUserId(group.getCreatedBy().getId());
        dto.setMembers(group.getMembers().stream()
                .map(user -> new MemberDto(user.getId(), user.getName()))
                .collect(Collectors.toSet()));
        return dto;
    }
    @GetMapping
    public ResponseEntity<List<GroupResponseDto>> getUserGroups() {
        System.out.println(">>> INSIDE GroupController.getUserGroups() method.");

        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Group> groups = groupRepository.findByMembers_Id(currentUser.getId());

        List<GroupResponseDto> groupDtos = groups.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(groupDtos);
    }
    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupResponseDto> addMember(
            @PathVariable Long groupId,
            @RequestBody AddMemberRequestDto addMemberRequestDto) {

        try {
            Group updatedGroup = groupService.addMemberToGroup(groupId, addMemberRequestDto.getEmail());
            return ResponseEntity.ok(convertToDto(updatedGroup));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null); 
        }
    }
    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponseDto> getGroupById(@PathVariable Long groupId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));

        Group group = groupRepository.findByIdWithMembers(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getMembers().stream().noneMatch(member -> member.getId().equals(currentUser.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(convertToDto(group));
    }
}