package com.omar.jobtracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {

    @Email(message = "email must be valid")
    @NotBlank(message = "email is required")
    @Size(max = 254, message = "email must be 254 characters or fewer")
    private String email;

    @NotBlank(message = "password is required")
    @Size(min = 12, max = 128, message = "password must be between 12 and 128 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$",
            message = "password must include upper, lower, number, and special character"
    )
    private String password;
}
