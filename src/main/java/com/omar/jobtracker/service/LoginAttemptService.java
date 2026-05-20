package com.omar.jobtracker.service;

import com.omar.jobtracker.exception.TooManyRequestsException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_FAILURES = 5;
    private static final Duration FAILURE_WINDOW = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, Deque<Long>> failuresByEmail = new ConcurrentHashMap<>();

    public void ensureNotBlocked(String email) {
        long now = System.currentTimeMillis();
        long windowMillis = FAILURE_WINDOW.toMillis();
        Deque<Long> failures = failuresByEmail.computeIfAbsent(email, unused -> new ArrayDeque<>());

        synchronized (failures) {
            evictExpired(failures, now, windowMillis);
            if (failures.size() >= MAX_FAILURES) {
                long retryAfterMillis = Math.max(1000, windowMillis - (now - failures.peekFirst()));
                throw new TooManyRequestsException("Too many failed login attempts. Try again later.", (retryAfterMillis + 999) / 1000);
            }
        }
    }

    public void recordFailure(String email) {
        long now = System.currentTimeMillis();
        long windowMillis = FAILURE_WINDOW.toMillis();
        Deque<Long> failures = failuresByEmail.computeIfAbsent(email, unused -> new ArrayDeque<>());

        synchronized (failures) {
            evictExpired(failures, now, windowMillis);
            failures.addLast(now);
        }
    }

    public void clearFailures(String email) {
        failuresByEmail.remove(email);
    }

    private void evictExpired(Deque<Long> failures, long now, long windowMillis) {
        while (!failures.isEmpty() && now - failures.peekFirst() >= windowMillis) {
            failures.removeFirst();
        }
    }
}
