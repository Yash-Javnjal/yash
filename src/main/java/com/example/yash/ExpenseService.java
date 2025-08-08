package com.example.yash;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ExpenseService {

    private final ExpenseRepository repository;

    public ExpenseService(ExpenseRepository repository) {
        this.repository = repository;
    }

    public List<Expense> getAll() {
        return repository.findAll();
    }

    public Expense save(Expense expense) {
        return repository.save(expense);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
