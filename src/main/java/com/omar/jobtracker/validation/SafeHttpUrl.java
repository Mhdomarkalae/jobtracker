package com.omar.jobtracker.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = SafeHttpUrlValidator.class)
@Target({FIELD})
@Retention(RUNTIME)
public @interface SafeHttpUrl {

    String message() default "must be a valid http:// or https:// URL";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
