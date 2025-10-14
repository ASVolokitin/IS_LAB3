package com.ticketis.app.config;

import java.util.Objects;
import javax.sql.DataSource;
import org.eclipse.persistence.jpa.PersistenceProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.EclipseLinkJpaVendorAdapter;

@Configuration
public class JpaConfig {

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);

        em.setPackagesToScan("com.ticketis.app.model", "com.ticketis.app.converter");

        em.setPersistenceProviderClass(PersistenceProvider.class);
        em.setJpaVendorAdapter(new EclipseLinkJpaVendorAdapter());

        return em;
    }

    @Bean
    public JpaTransactionManager transactionManager(
            LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        return new JpaTransactionManager(
                Objects.requireNonNull(
                        entityManagerFactory.getObject(), "EntityManagerFactory must not be null"));
    }
}