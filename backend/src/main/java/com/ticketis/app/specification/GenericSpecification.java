package com.ticketis.app.specification;

import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

public class GenericSpecification {
    public static <T> Specification<T> stringContains(String fieldPath, String value) {
        if (value == null || value.isBlank()) {
            return null; 
        }

        return (root, query, cb) -> {
            Path<String> path = resolvePath(root, fieldPath);
            return cb.like(cb.lower(path), "%" + value.toLowerCase() + "%");
        };
    }

    @SuppressWarnings("unchecked")
    private static <T> Path<String> resolvePath(Root<T> root, String fieldPath) {
        String[] fields = fieldPath.split("\\.");
        Path<?> path = root;
        for (String field : fields) {
            path = path.get(field);
        }
        return (Path<String>) path;
    }
}
