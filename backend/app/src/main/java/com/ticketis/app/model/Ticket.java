package com.ticketis.app.model;

import com.ticketis.app.model.enums.TicketType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "tickets")
public class Ticket implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Поле не может быть null,
    // Значение поля должно быть больше 0,
    // Значение этого поля должно быть уникальным,
    // Значение этого поля должно генерироваться автоматически
    private Long id; 
    
    @NotBlank
    @NotNull
    private String name; // Поле не может быть null, Строка не может быть пустой
    
    @NotNull
    @Valid
    @ManyToOne
    @JoinColumn(name = "coordinates_id")
    private Coordinates coordinates; // Поле не может быть null
    
    // Поле не может быть null, Значение этого поля должно генерироваться автоматически
    @NotNull
    @Column(name = "creation_date")
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date creationDate; 
    
    @ManyToOne
    @Valid
    @JoinColumn(name = "person_id")
    private Person person; // Поле может быть null
    
    @ManyToOne
    @Valid
    @JoinColumn(name = "event_id")
    private Event event; // Поле может быть null
    
    @NotNull
    @Positive
    private Long price; // Поле не может быть null, Значение поля должно быть больше 0
    
    @Enumerated(EnumType.STRING)
    private TicketType type; // Поле может быть null
    
    // Поле может быть null, Значение поля должно быть больше 0, Максимальное значение поля: 100
    @Positive
    @Max(value = 100)
    private Float discount; 
    
    @Positive
    private double number; // Значение поля должно быть больше 0
    
    @NotNull
    private Boolean refundable; // Поле не может быть null
    
    @ManyToOne
    @Valid
    @JoinColumn(name = "venue_id")
    @NotNull
    private Venue venue; // Поле не может быть null


    public Ticket(String name,
                    Coordinates coordinates,
                    Person person, Event event,
                    Long price, TicketType type,
                    Float discount, double number,
                    Boolean refundable, Venue venue) {
        this.name = name;
        this.coordinates = coordinates;
        this.person = person;
        this.event = event;
        this.price = price;
        this.type = type;
        this.discount = discount;
        this.number = number;
        this.refundable = refundable;
        this.venue = venue;
    }

    @PrePersist
    private void onCreate() {
        creationDate = new Date();
    }
}