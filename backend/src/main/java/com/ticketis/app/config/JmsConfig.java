package com.ticketis.app.config;

import jakarta.jms.ConnectionFactory;
import jakarta.jms.Queue;
import lombok.extern.slf4j.Slf4j;
import org.apache.activemq.artemis.jms.client.ActiveMQQueue;
import org.springframework.boot.autoconfigure.jms.DefaultJmsListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;
import org.springframework.jms.config.JmsListenerContainerFactory;

@Configuration
@EnableJms
@Slf4j
public class JmsConfig {

    @Bean
    public JmsListenerContainerFactory<?> queueListenerFactory(
            ConnectionFactory connectionFactory,
            DefaultJmsListenerContainerFactoryConfigurer configurer) {
        DefaultJmsListenerContainerFactory factory = new DefaultJmsListenerContainerFactory();
        configurer.configure(factory, connectionFactory);
        factory.setSessionTransacted(true);
        factory.setConcurrency("5-10");
        factory.setErrorHandler(t -> {
            log.error("JMS error occurred: {}", t.getMessage(), t);
        });
        return factory;
    }

    @Bean
    public Queue importBatchQueue() {
        return new ActiveMQQueue("import.batch.queue");
    }

    @Bean
    public Queue fileUploadQueue() {
        return new ActiveMQQueue("file.upload.queue");
    }

    @Bean
    public Queue fileDeleteQueue() {
        return new ActiveMQQueue("file.delete.queue");
    }
}