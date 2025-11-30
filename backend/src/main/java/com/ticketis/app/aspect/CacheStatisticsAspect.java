package com.ticketis.app.aspect;

import jakarta.persistence.Cache;
import jakarta.persistence.EntityManagerFactory;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
@ConditionalOnProperty(name = "app.cache.statistics.enabled", havingValue = "true", matchIfMissing = true)
public class CacheStatisticsAspect {

    private final EntityManagerFactory entityManagerFactory;

    public CacheStatisticsAspect(EntityManagerFactory entityManagerFactory) {
        this.entityManagerFactory = entityManagerFactory;
        log.info("CacheStatisticsAspect initialized and ready to log cache statistics!");
    }

    @Around("execution(* com.ticketis.app.service.*Service.get*ById(..))")
    public Object logCacheStatistics(ProceedingJoinPoint joinPoint) throws Throwable {
        if (entityManagerFactory.getCache() == null) {
            return joinPoint.proceed();
        }

        Object[] args = joinPoint.getArgs();
        if (args.length == 0 || args[0] == null) {
            return joinPoint.proceed();
        }

        Object id = args[0];
        Class<?> entityClass = extractEntityClassFromService(joinPoint);
        
        if (entityClass == null) {
            return joinPoint.proceed();
        }

        Cache cache = entityManagerFactory.getCache();
        boolean isInCache = cache.contains(entityClass, id);

        Object result = joinPoint.proceed();

        if (isInCache && result != null) {
            log.info("CACHE HIT: Entity {} with id {} was found in cache", 
                    entityClass.getSimpleName(), id);
        } else if (result != null) {
            log.info("CACHE MISS: Entity {} with id {} was not in cache, loaded from database", 
                    entityClass.getSimpleName(), id);
        }

        return result;
    }

    private Class<?> extractEntityClassFromService(ProceedingJoinPoint joinPoint) {
        try {
            Class<?> returnType = ((org.aspectj.lang.reflect.MethodSignature) joinPoint.getSignature()).getReturnType();
            if (returnType != null && !returnType.equals(Object.class) && !returnType.isPrimitive()) {
                return returnType;
            }
            
            String className = joinPoint.getTarget().getClass().getSimpleName();
            if (className.endsWith("Service")) {
                String entityName = className.substring(0, className.length() - "Service".length());
                try {
                    return Class.forName("com.ticketis.app.model." + entityName);
                } catch (ClassNotFoundException e) {
                    log.debug("Could not find entity class: com.ticketis.app.model.{}", entityName);
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract entity class: {}", e.getMessage());
        }
        return null;
    }
}
