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

   
    List<Group> findByMembers_Id(Long userId);
    @Query("SELECT g FROM Group g LEFT JOIN FETCH g.members WHERE g.id = :groupId")
    Optional<Group> findByIdWithMembers(@Param("groupId") Long groupId);

}