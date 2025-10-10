package com.smartsplitter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "expense_splits")
@Data
@NoArgsConstructor
public class ExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal amountOwed;

    public ExpenseSplit(Expense expense, User user, BigDecimal amountOwed) {
        this.expense = expense;
        this.user = user;
        this.amountOwed = amountOwed;
    }
}