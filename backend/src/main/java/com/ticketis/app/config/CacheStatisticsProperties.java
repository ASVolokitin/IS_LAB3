package com.ticketis.app.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.cache.statistics")
@Getter
@Setter
public class CacheStatisticsProperties {
    private boolean enabled = false;
}





