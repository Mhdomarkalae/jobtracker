package com.omar.jobtracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omar.jobtracker.model.Application;
import com.omar.jobtracker.model.ApplicationStatus;
import com.omar.jobtracker.model.User;
import com.omar.jobtracker.repository.ApplicationRepository;
import com.omar.jobtracker.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        applicationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void unauthenticatedApiRequestsAreRejected() throws Exception {
        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void signupDoesNotEnumerateExistingAccounts() throws Exception {
        CsrfExchange csrfExchange = fetchCsrf();

        mockMvc.perform(post("/api/auth/signup")
                        .cookie(csrfExchange.cookie())
                        .header("X-XSRF-TOKEN", csrfExchange.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"person@example.com","password":"StrongPass!123"}
                                """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value("If the email is eligible, the account is ready for sign-in."));

        mockMvc.perform(post("/api/auth/signup")
                        .cookie(csrfExchange.cookie())
                        .header("X-XSRF-TOKEN", csrfExchange.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"person@example.com","password":"StrongPass!123"}
                                """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value("If the email is eligible, the account is ready for sign-in."));
    }

    @Test
    void loginSetsSessionCookieAndLogoutInvalidatesIt() throws Exception {
        userRepository.save(User.builder()
                .email("secure@example.com")
                .passwordHash(passwordEncoder.encode("StrongPass!123"))
                .build());

        CsrfExchange csrfExchange = fetchCsrf();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .cookie(csrfExchange.cookie())
                        .header("X-XSRF-TOKEN", csrfExchange.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"secure@example.com","password":"StrongPass!123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("JT_SESSION"))
                .andReturn();

        Cookie sessionCookie = loginResult.getResponse().getCookie("JT_SESSION");
        assertThat(sessionCookie).isNotNull();

        mockMvc.perform(get("/api/auth/me").cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("secure@example.com"));

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(sessionCookie, csrfExchange.cookie())
                        .header("X-XSRF-TOKEN", csrfExchange.token()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/auth/me").cookie(sessionCookie))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ownershipChecksPreventIdorAccess() throws Exception {
        User owner = userRepository.save(User.builder()
                .email("owner@example.com")
                .passwordHash(passwordEncoder.encode("StrongPass!123"))
                .build());
        User attacker = userRepository.save(User.builder()
                .email("attacker@example.com")
                .passwordHash(passwordEncoder.encode("StrongPass!123"))
                .build());

        Application application = applicationRepository.save(Application.builder()
                .companyName("Acme")
                .positionTitle("Backend Engineer")
                .dateApplied(LocalDate.now().minusDays(1))
                .currentStatus(ApplicationStatus.APPLIED)
                .salary(java.math.BigDecimal.valueOf(100000))
                .user(owner)
                .build());

        CsrfExchange csrfExchange = fetchCsrf();
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .cookie(csrfExchange.cookie())
                        .header("X-XSRF-TOKEN", csrfExchange.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"attacker@example.com","password":"StrongPass!123"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        Cookie attackerSession = loginResult.getResponse().getCookie("JT_SESSION");

        mockMvc.perform(get("/api/jobs/" + application.getId()).cookie(attackerSession))
                .andExpect(status().isNotFound());
    }

    @Test
    void repeatedFailedLoginsAreRateLimited() throws Exception {
        userRepository.save(User.builder()
                .email("rate@example.com")
                .passwordHash(passwordEncoder.encode("StrongPass!123"))
                .build());

        CsrfExchange csrfExchange = fetchCsrf();
        for (int attempt = 0; attempt < 5; attempt++) {
            mockMvc.perform(post("/api/auth/login")
                            .cookie(csrfExchange.cookie())
                            .header("X-XSRF-TOKEN", csrfExchange.token())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"rate@example.com","password":"WrongPass!123"}
                                    """))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/api/auth/login")
                        .cookie(csrfExchange.cookie())
                        .header("X-XSRF-TOKEN", csrfExchange.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"rate@example.com","password":"WrongPass!123"}
                                """))
                .andExpect(status().isTooManyRequests());
    }

    private CsrfExchange fetchCsrf() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode payload = objectMapper.readTree(result.getResponse().getContentAsString());
        Cookie cookie = result.getResponse().getCookie("XSRF-TOKEN");
        return new CsrfExchange(payload.get("token").asText(), cookie);
    }

    private record CsrfExchange(String token, Cookie cookie) {
    }
}
