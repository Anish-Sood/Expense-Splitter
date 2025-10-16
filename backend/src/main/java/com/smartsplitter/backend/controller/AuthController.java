package com.smartsplitter.backend.controller;

import com.smartsplitter.backend.dto.LoginRequestDto;
import com.smartsplitter.backend.dto.LoginResponseDto;
import com.smartsplitter.backend.dto.RegisterRequestDto;
import com.smartsplitter.backend.entity.User;
import com.smartsplitter.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth") 
public class AuthController {

    private final AuthService authService;

    @Autowired 
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register") 
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDto registerRequestDto) {
        User newUser = new User();
        newUser.setName(registerRequestDto.getName());
        newUser.setEmail(registerRequestDto.getEmail());
        newUser.setPassword(registerRequestDto.getPassword());

        try {
            User savedUser = authService.registerUser(newUser);

            return ResponseEntity.ok("User registered successfully!");

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDto loginRequestDto) {
        try {
            String token = authService.loginUser(loginRequestDto.getEmail(), loginRequestDto.getPassword());
            return ResponseEntity.ok(new LoginResponseDto(token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}