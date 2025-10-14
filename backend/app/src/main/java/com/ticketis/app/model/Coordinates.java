package com.ticketis.app.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "coordinates")
public class Coordinates implements Serializable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Min(value = -200)
    private Integer x; // Значение поля должно быть больше -201, Поле не может быть null

    @NotNull
    @Min(value = -4)
    private Double y; // Значение поля должно быть больше -5, Поле не может быть null

    public Coordinates(Integer x, Double y) {
        this.x = x;
        this.y = y;
    }
}