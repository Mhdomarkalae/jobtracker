package com.omar.jobtracker.service;

import com.omar.jobtracker.exception.TooManyRequestsException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final ConcurrentHashMap<String, Deque<Long>> requestsByKey = new ConcurrentHashMap<>();

    public void enforce(String key, int limit, Duration window, String message) {
        long now = System.currentTimeMillis();
        long windowMillis = window.toMillis();
        Deque<Long> timestamps = requestsByKey.computeIfAbsent(key, unused -> new ArrayDeque<>());

        synchronized (timestamps) {
            evictExpired(timestamps, now, windowMillis);
            if (timestamps.size() >= limit) {
                long retryAfterMillis = Math.max(1000, windowMillis - (now - timestamps.peekFirst()));
                throw new TooManyRequestsException(message, (retryAfterMillis + 999) / 1000);
            }
            timestamps.addLast(now);
        }
    }

    private void evictExpired(Deque<Long> timestamps, long now, long windowMillis) {
        while (!timestamps.isEmpty() && now - timestamps.peekFirst() >= windowMillis) {
            timestamps.removeFirst();
        }
    }
}
