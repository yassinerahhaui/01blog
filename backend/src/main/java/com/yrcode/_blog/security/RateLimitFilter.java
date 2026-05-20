package com.yrcode._blog.security;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yrcode._blog.shared.GlobalResponse;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Value("${rate-limit.enabled:true}")
    private boolean enabled;
    @Value("${rate-limit.capacity:300}")
    private long capacity;
    @Value("${rate-limit.window-seconds:30}")
    private long windowSeconds;
    @Value("${rate-limit.eviction-seconds:300}")
    private long evictionSeconds;

    private double refillTokensPerNanos;

    public RateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void initialize() {
        if (capacity <= 0 || windowSeconds <= 0) {
            enabled = false;
            return;
        }
        long windowNanos = TimeUnit.SECONDS.toNanos(windowSeconds);
        refillTokensPerNanos = capacity / (double) windowNanos;
        if (evictionSeconds <= 0) {
            evictionSeconds = Math.max(60, windowSeconds);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!enabled) {
            return true;
        }
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        return path == null || !path.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long nowNanos = System.nanoTime();
        String clientKey = resolveClientKey(request);
        TokenBucket bucket = buckets.computeIfAbsent(clientKey,
                key -> new TokenBucket(capacity, refillTokensPerNanos, nowNanos));

        RateLimitDecision decision = bucket.tryConsume(nowNanos);

        response.setHeader("X-Rate-Limit-Limit", String.valueOf(capacity));
        response.setHeader("X-Rate-Limit-Remaining", String.valueOf(decision.remainingTokens));

        if (!decision.allowed) {
            long resetSeconds = Math.max(1, decision.retryAfterSeconds);
            response.setStatus(429);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Retry-After", String.valueOf(resetSeconds));
            response.setHeader("X-Rate-Limit-Reset",
                    String.valueOf(Instant.now().getEpochSecond() + resetSeconds));

            var errors = List.of(new GlobalResponse.ErrorItem("Rate limit exceeded. Try again later."));
            response.getWriter().write(objectMapper.writeValueAsString(new GlobalResponse<>(errors)));
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Scheduled(fixedDelayString = "${rate-limit.eviction-interval-ms:60000}")
    public void evictIdleBuckets() {
        if (!enabled || buckets.isEmpty()) {
            return;
        }
        long cutoff = System.nanoTime() - TimeUnit.SECONDS.toNanos(evictionSeconds);
        buckets.entrySet().removeIf(entry -> entry.getValue().getLastSeenNanos() < cutoff);
    }

    private String resolveClientKey(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String[] parts = forwardedFor.split(",");
            if (parts.length > 0 && !parts[0].isBlank()) {
                return parts[0].trim();
            }
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private static final class RateLimitDecision {
        private final boolean allowed;
        private final long remainingTokens;
        private final long retryAfterSeconds;

        private RateLimitDecision(boolean allowed, long remainingTokens, long retryAfterSeconds) {
            this.allowed = allowed;
            this.remainingTokens = remainingTokens;
            this.retryAfterSeconds = retryAfterSeconds;
        }
    }

    private static final class TokenBucket {
        private final long capacity;
        private final double refillTokensPerNanos;
        private double tokens;
        private long lastRefillTimeNanos;
        private volatile long lastSeenNanos;

        private TokenBucket(long capacity, double refillTokensPerNanos, long nowNanos) {
            this.capacity = capacity;
            this.refillTokensPerNanos = refillTokensPerNanos;
            this.tokens = capacity;
            this.lastRefillTimeNanos = nowNanos;
            this.lastSeenNanos = nowNanos;
        }

        private RateLimitDecision tryConsume(long nowNanos) {
            synchronized (this) {
                refill(nowNanos);
                this.lastSeenNanos = nowNanos;

                if (tokens >= 1d) {
                    tokens -= 1d;
                    long remaining = (long) Math.floor(tokens);
                    return new RateLimitDecision(true, remaining, 0);
                }

                long retryAfterSeconds = estimateRetryAfterSeconds();
                return new RateLimitDecision(false, 0, retryAfterSeconds);
            }
        }

        private void refill(long nowNanos) {
            long elapsedNanos = nowNanos - lastRefillTimeNanos;
            if (elapsedNanos <= 0) {
                return;
            }
            double refill = elapsedNanos * refillTokensPerNanos;
            if (refill > 0d) {
                tokens = Math.min(capacity, tokens + refill);
                lastRefillTimeNanos = nowNanos;
            }
        }

        private long estimateRetryAfterSeconds() {
            if (refillTokensPerNanos <= 0d) {
                return 1;
            }
            double missingTokens = 1d - tokens;
            if (missingTokens <= 0d) {
                return 1;
            }
            long nanosToWait = (long) Math.ceil(missingTokens / refillTokensPerNanos);
            long seconds = (long) Math.ceil(nanosToWait / 1_000_000_000d);
            return Math.max(1, seconds);
        }

        private long getLastSeenNanos() {
            return lastSeenNanos;
        }
    }
}
