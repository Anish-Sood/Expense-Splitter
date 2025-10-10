package com.smartsplitter.backend.service;

import com.smartsplitter.backend.dto.SettlementDto;
import com.smartsplitter.backend.entity.Expense;
import com.smartsplitter.backend.entity.Group;
import com.smartsplitter.backend.entity.User;
import com.smartsplitter.backend.repository.ExpenseRepository;
import com.smartsplitter.backend.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SettlementService {

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;

    @Autowired
    public SettlementService(GroupRepository groupRepository, ExpenseRepository expenseRepository) {
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
    }

    public List<SettlementDto> calculateSettlements(Long groupId) {
        Group group = groupRepository.findByIdWithMembers(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Map<User, BigDecimal> balances = new HashMap<>();
        for (User member : group.getMembers()) {
            balances.put(member, BigDecimal.ZERO);
        }

        List<Expense> expenses = expenseRepository.findByGroupIdWithDetails(groupId);
        for (Expense expense : expenses) {
            User paidBy = expense.getPaidBy();
            balances.put(paidBy, balances.get(paidBy).add(expense.getAmount()));

            expense.getSplits().forEach(split -> {
                User member = split.getUser();
                balances.put(member, balances.get(member).subtract(split.getAmountOwed()));
            });
        }

        List<Map.Entry<User, BigDecimal>> creditors = balances.entrySet().stream()
                .filter(entry -> entry.getValue().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());

        List<Map.Entry<User, BigDecimal>> debtors = balances.entrySet().stream()
                .filter(entry -> entry.getValue().compareTo(BigDecimal.ZERO) < 0)
                .collect(Collectors.toList());

        List<SettlementDto> settlements = new ArrayList<>();
        int creditorIndex = 0;
        int debtorIndex = 0;

        while (creditorIndex < creditors.size() && debtorIndex < debtors.size()) {
            Map.Entry<User, BigDecimal> creditor = creditors.get(creditorIndex);
            Map.Entry<User, BigDecimal> debtor = debtors.get(debtorIndex);

            BigDecimal amountCredited = creditor.getValue();
            BigDecimal amountDebited = debtor.getValue().abs();

            BigDecimal settlementAmount = amountCredited.min(amountDebited);

            settlements.add(new SettlementDto(
                    debtor.getKey().getId(), debtor.getKey().getName(),
                    creditor.getKey().getId(), creditor.getKey().getName(),
                    settlementAmount
            ));

            creditor.setValue(amountCredited.subtract(settlementAmount));
            debtor.setValue(debtor.getValue().add(settlementAmount));

            if (debtor.getValue().compareTo(BigDecimal.ZERO) == 0) {
                debtorIndex++;
            }
            if (creditor.getValue().compareTo(BigDecimal.ZERO) == 0) {
                creditorIndex++;
            }
        }

        return settlements;
    }
}