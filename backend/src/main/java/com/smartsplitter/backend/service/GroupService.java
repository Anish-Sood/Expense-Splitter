package com.smartsplitter.backend.service;

import com.smartsplitter.backend.entity.Group;
import com.smartsplitter.backend.entity.User;
import com.smartsplitter.backend.repository.GroupRepository;
import com.smartsplitter.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Autowired
    public GroupService(GroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Group createGroup(String groupName) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = userDetails.getUsername(); // This is the user's email

        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group newGroup = new Group();
        newGroup.setName(groupName);
        newGroup.setCreatedBy(currentUser);

        newGroup.getMembers().add(currentUser);

        return groupRepository.save(newGroup);
    }
    @Transactional
    public Group addMemberToGroup(Long groupId, String memberEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId));

        User userToAdd = userRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + memberEmail));

        if (group.getMembers().contains(userToAdd)) {
            throw new IllegalArgumentException("User is already a member of this group.");
        }

        group.getMembers().add(userToAdd);

        return groupRepository.save(group);
    }
}