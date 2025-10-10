package com.smartsplitter.backend.repository;

import com.smartsplitter.backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    // Custom query method to find all groups that a specific user is a member of.
    // Spring Data JPA will parse this method name and create the correct query.
    List<Group> findByMembers_Id(Long userId);
    // --- NEW METHOD ---
    // This query fetches a Group and also initializes its 'members' collection in one go.
    @Query("SELECT g FROM Group g LEFT JOIN FETCH g.members WHERE g.id = :groupId")
    Optional<Group> findByIdWithMembers(@Param("groupId") Long groupId);

}