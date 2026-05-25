package com.omar.jobtracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthRequest {

    @Email(message = "email must be valid")
    @NotBlank(message = "email is required")
    @Size(max = 254, message = "email must be 254 characters or fewer")
    private String email;

    @NotBlank(message = "password is required")
    private String password;
}
