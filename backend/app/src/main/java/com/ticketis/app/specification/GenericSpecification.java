package com.ticketis.app.specification;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;

public class GenericSpecification {
    public static <T> Specification<T> stringContains(String fieldPath, String value) {
        return (root, query, cb) -> {
            if (value == null || value.isBlank()) {
                return null;
            }

            Path<String> path = resolvePath(root, fieldPath);
            return cb.like(cb.lower(path), "%" + value.toLowerCase() + "%");
        };
    }

    private static <T> Path<String> resolvePath(Root<T> root, String fieldPath) {
        String[] fields = fieldPath.split("\\.");
        Path<?> path = root;

        for (String field : fields) {
            path = path.get(field);
        }

        @SuppressWarnings("unchecked")
        Path<String> stringPath = (Path<String>) path;
        return stringPath;
    }
}
