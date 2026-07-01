package com.finpme.backend.auth.dto;

import com.finpme.backend.auth.entity.Plan;

public record AuthResponse(String token, String email, String name, Plan plan) {
}
