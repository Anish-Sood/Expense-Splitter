package com.smartsplitter.backend.controller;

import com.smartsplitter.backend.dto.SettlementDto;
import com.smartsplitter.backend.service.SettlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/settlements")
public class SettlementController {

    private final SettlementService settlementService;

    @Autowired
    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }



    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<SettlementDto>> getSettlementsForGroup(@PathVariable Long groupId) {
        List<SettlementDto> settlements = settlementService.calculateSettlements(groupId);
        return ResponseEntity.ok(settlements);
    }
}