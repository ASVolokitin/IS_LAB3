package com.ticketis.app.aspect;

import com.ticketis.app.config.CacheStatisticsProperties;
import com.ticketis.app.model.Ticket;
import jakarta.persistence.Cache;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.SessionFactory;
import org.hibernate.cache.spi.CacheImplementor;
import org.hibernate.cache.spi.Region;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicLong;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class CacheStatisticsAspect {

    private final CacheStatisticsProperties cacheStatisticsProperties;
    
    @PersistenceContext
    private EntityManager entityManager;

    private static final String TICKET_CACHE_REGION = Ticket.class.getName();
    
    private final AtomicLong cacheHits = new AtomicLong(0);
    private final AtomicLong cacheMisses = new AtomicLong(0);

    @Around("execution(* com.ticketis.app.repository.TicketRepository.*(..))")
    public Object logCacheStatistics(ProceedingJoinPoint joinPoint) throws Throwable {
        if (!cacheStatisticsProperties.isEnabled()) {
            return joinPoint.proceed();
        }

        String methodName = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();
        
        boolean isReadOperation = isReadOperation(methodName);
        
        if (!isReadOperation) {
            return joinPoint.proceed();
        }

        Long entityId = extractEntityId(args);
        
        boolean wasInCache = false;
        if (entityId != null) {
            wasInCache = isEntityInCache(entityId);
        }

        Object result = joinPoint.proceed();

        if (entityId != null) {
            if (wasInCache) {
                long hits = cacheHits.incrementAndGet();
                long misses = cacheMisses.get();
                long total = hits + misses;
                
                log.info("Ticket L2 Cache for '{}' (ID: {}): HIT - Total: Hits={}, Misses={}, Total={}",
                        methodName,
                        entityId,
                        hits,
                        misses,
                        total);
            } else {
                long hits = cacheHits.get();
                long misses = cacheMisses.incrementAndGet();
                long total = hits + misses;
                
                log.info("Ticket L2 Cache for '{}' (ID: {}): MISS - Total: Hits={}, Misses={}, Total={}",
                        methodName,
                        entityId,
                        hits,
                        misses,
                        total);
            }
        }

        return result;
    }

    private boolean isReadOperation(String methodName) {
        String lowerMethodName = methodName.toLowerCase();
        return lowerMethodName.contains("find") 
            || lowerMethodName.contains("get")
            || lowerMethodName.contains("exists")
            || lowerMethodName.contains("count")
            || lowerMethodName.contains("findall")
            || lowerMethodName.contains("findone");
    }

    private Long extractEntityId(Object[] args) {
        if (args == null || args.length == 0) {
            return null;
        }
        
        Object firstArg = args[0];
        if (firstArg instanceof Long) {
            return (Long) firstArg;
        } else if (firstArg instanceof Number) {
            return ((Number) firstArg).longValue();
        }
        
        return null;
    }

    private boolean isEntityInCache(Long entityId) {
        try {
            Cache cache = entityManager.getEntityManagerFactory().getCache();
            return cache.contains(Ticket.class, entityId);
        } catch (Exception e) {
            log.debug("Failed to check cache for entity ID {}: {}", entityId, e.getMessage());
            return false;
        }
    }

    @SuppressWarnings("unused")
    private void logInfinispanStatistics() {
        try {
            SessionFactory sessionFactory = entityManager.getEntityManagerFactory()
                    .unwrap(SessionFactory.class);
            
            if (sessionFactory instanceof SessionFactoryImplementor) {
                SessionFactoryImplementor sfi = (SessionFactoryImplementor) sessionFactory;
                CacheImplementor cacheImplementor = sfi.getCache();
                
                if (cacheImplementor != null) {
                    Region region = cacheImplementor.getRegion(TICKET_CACHE_REGION);
                    if (region != null) {
                        log.debug("Cache region '{}' is available", TICKET_CACHE_REGION);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Could not access Infinispan statistics: {}", e.getMessage());
        }
    }
}

