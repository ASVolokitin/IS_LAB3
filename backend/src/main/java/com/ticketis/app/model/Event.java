package com.ticketis.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "events")
public class Event implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Поле не может быть null, Значение поля должно быть больше 0,
    // Значение этого поля должно быть уникальным,
    // Значение этого поля должно генерироваться автоматически
    private Integer id;
    
    
    @NotBlank
    // Поле не может быть null, Строка не может быть пустой
    private String name; 

    private Date date; // Поле может быть null

    @Column(name = "min_age")
    private Integer minAge; // Поле может быть null

    @NotNull
    private String description; // Поле не может быть null

    public Event(String name, Date date, Integer minAge, String description) {
        this.name = name;
        this.date = date;
        this.minAge = minAge;
        this.description = description;
    }
}