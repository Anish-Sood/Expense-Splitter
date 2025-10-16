package com.smartsplitter.backend.service;

import com.smartsplitter.backend.dto.CreateExpenseRequestDto;
import com.smartsplitter.backend.dto.SplitDetailDto;
import com.smartsplitter.backend.entity.*;
import com.smartsplitter.backend.repository.ExpenseRepository;
import com.smartsplitter.backend.repository.GroupRepository;
import com.smartsplitter.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

import com.smartsplitter.backend.dto.SpendingByCategoryDto;
import com.smartsplitter.backend.entity.ExpenseCategory;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository, GroupRepository groupRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Expense createExpense(CreateExpenseRequestDto requestDto) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User paidBy = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Group group = groupRepository.findByIdWithMembers(requestDto.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getMembers().stream().noneMatch(member -> member.getId().equals(paidBy.getId()))) {
            throw new SecurityException("User is not a member of this group");
        }

        Expense expense = new Expense();
        expense.setDescription(requestDto.getDescription());
        expense.setAmount(requestDto.getAmount());
        expense.setCategory(requestDto.getCategory());
        expense.setDate(LocalDateTime.now());
        expense.setPaidBy(paidBy);
        expense.setGroup(group);
        expense.setSplitType(requestDto.getSplitType());

        List<ExpenseSplit> splits = new ArrayList<>();
        Set<User> groupMembers = group.getMembers();
        Map<Long, User> membersMap = groupMembers.stream().collect(Collectors.toMap(User::getId, user -> user));

        switch (requestDto.getSplitType()) {
            case EQUAL:
                int numberOfMembers = groupMembers.size();
                if (numberOfMembers == 0) throw new IllegalArgumentException("Group has no members.");
                BigDecimal equalShare = requestDto.getAmount().divide(new BigDecimal(numberOfMembers), 2, RoundingMode.HALF_UP);
                for (User member : groupMembers) {
                    splits.add(new ExpenseSplit(expense, member, equalShare));
                }
                break;

            case BY_AMOUNT:
                BigDecimal totalAmountSplit = BigDecimal.ZERO;
                for (SplitDetailDto splitDetail : requestDto.getSplits()) {
                    User member = membersMap.get(splitDetail.getUserId());
                    if (member == null) throw new IllegalArgumentException("Invalid user ID in split details.");
                    splits.add(new ExpenseSplit(expense, member, splitDetail.getValue()));
                    totalAmountSplit = totalAmountSplit.add(splitDetail.getValue());
                }
                if (totalAmountSplit.compareTo(requestDto.getAmount()) != 0) {
                    throw new IllegalArgumentException("Sum of split amounts must equal the total expense amount.");
                }
                break;

            case BY_PERCENTAGE:
                BigDecimal totalPercentage = BigDecimal.ZERO;
                for (SplitDetailDto splitDetail : requestDto.getSplits()) {
                    totalPercentage = totalPercentage.add(splitDetail.getValue());
                }
                if (totalPercentage.compareTo(new BigDecimal("100")) != 0) {
                    throw new IllegalArgumentException("Percentages must add up to 100.");
                }
                for (SplitDetailDto splitDetail : requestDto.getSplits()) {
                    User member = membersMap.get(splitDetail.getUserId());
                    if (member == null) throw new IllegalArgumentException("Invalid user ID in split details.");
                    BigDecimal shareAmount = requestDto.getAmount()
                            .multiply(splitDetail.getValue())
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                    splits.add(new ExpenseSplit(expense, member, shareAmount));
                }
                break;
        }

        expense.setSplits(splits);

        Expense savedExpense = expenseRepository.save(expense);

        return expenseRepository.findByIdWithDetails(savedExpense.getId())
                .orElseThrow(() -> new RuntimeException("Could not re-fetch saved expense"));
    }
    public List<SpendingByCategoryDto> getSpendingByCategory(Long groupId) {
        
        List<Expense> expenses = expenseRepository.findByGroupIdWithDetails(groupId);

        Map<ExpenseCategory, BigDecimal> spendingMap = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        return spendingMap.entrySet().stream()
                .map(entry -> new SpendingByCategoryDto(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(SpendingByCategoryDto::getAmount).reversed()) // Optional: sort by amount
                .collect(Collectors.toList());
    }
    @Transactional
    public void deleteExpense(Long expenseId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        
        if (!expense.getPaidBy().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to delete this expense.");
        }

        expenseRepository.delete(expense);
    }
    @Transactional
    public Expense editExpense(Long expenseId, CreateExpenseRequestDto requestDto) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getPaidBy().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to edit this expense.");
        }

        Group group = groupRepository.findByIdWithMembers(requestDto.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        expense.setDescription(requestDto.getDescription());
        expense.setAmount(requestDto.getAmount());
        expense.setCategory(requestDto.getCategory());
        expense.setSplitType(requestDto.getSplitType());
        expense.setGroup(group);
        expense.getSplits().clear();

        List<ExpenseSplit> newSplits = new ArrayList<>();
        Set<User> groupMembers = group.getMembers();
        Map<Long, User> membersMap = groupMembers.stream().collect(Collectors.toMap(User::getId, user -> user));

        switch (requestDto.getSplitType()) {
            case EQUAL:
                int numberOfMembers = groupMembers.size();
                if (numberOfMembers == 0) throw new IllegalArgumentException("Group has no members.");
                BigDecimal equalShare = requestDto.getAmount().divide(new BigDecimal(numberOfMembers), 2, RoundingMode.HALF_UP);
                for (User member : groupMembers) {
                    newSplits.add(new ExpenseSplit(expense, member, equalShare));
                }
                break;

            case BY_AMOUNT:
                BigDecimal totalAmountSplit = BigDecimal.ZERO;
                for (SplitDetailDto splitDetail : requestDto.getSplits()) {
                    User member = membersMap.get(splitDetail.getUserId());
                    if (member == null) throw new IllegalArgumentException("Invalid user ID in split details.");
                    newSplits.add(new ExpenseSplit(expense, member, splitDetail.getValue()));
                    totalAmountSplit = totalAmountSplit.add(splitDetail.getValue());
                }
                if (totalAmountSplit.compareTo(requestDto.getAmount()) != 0) {
                    throw new IllegalArgumentException("Sum of split amounts must equal the total expense amount.");
                }
                break;

            case BY_PERCENTAGE:
                BigDecimal totalPercentage = BigDecimal.ZERO;
                for (SplitDetailDto splitDetail : requestDto.getSplits()) {
                    totalPercentage = totalPercentage.add(splitDetail.getValue());
                }
                if (totalPercentage.compareTo(new BigDecimal("100")) != 0) {
                    throw new IllegalArgumentException("Percentages must add up to 100.");
                }
                for (SplitDetailDto splitDetail : requestDto.getSplits()) {
                    User member = membersMap.get(splitDetail.getUserId());
                    if (member == null) throw new IllegalArgumentException("Invalid user ID in split details.");
                    BigDecimal shareAmount = requestDto.getAmount()
                            .multiply(splitDetail.getValue())
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                    newSplits.add(new ExpenseSplit(expense, member, shareAmount));
                }
                break;
        }

        expense.getSplits().addAll(newSplits);

        Expense savedExpense = expenseRepository.save(expense);

        return expenseRepository.findByIdWithDetails(savedExpense.getId())
                .orElseThrow(() -> new RuntimeException("Could not re-fetch saved expense"));
    }
}