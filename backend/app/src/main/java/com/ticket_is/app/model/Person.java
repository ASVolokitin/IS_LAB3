package com.ticket_is.app.model;

import java.io.Serializable;

import com.ticket_is.app.converter.ColorEnumConverter;
import com.ticket_is.app.model.enums.Color;
import com.ticket_is.app.model.enums.Country;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name="persons")
public class Person implements Serializable {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Convert(converter = ColorEnumConverter.class)
    @Column(name="eye_color")
    @NotNull
    private Color eyeColor; //Поле не может быть null

    @Enumerated(EnumType.STRING)
    @Convert(converter = ColorEnumConverter.class)
    @Column(name="hair_color")
    @NotNull
    private Color hairColor; //Поле не может быть null

    @ManyToOne
    @Valid
    private Location location; //Поле может быть null

    @Column(name="passport_id", unique=true)
    @NotBlank
    @Size(max=29)
    private String passportID; //Строка не может быть пустой, Длина строки не должна быть больше 29, Значение этого поля должно быть уникальным, Поле может быть null
    
    @Enumerated(EnumType.STRING)
    private Country nationality; //Поле может быть null

    public Person(Color eyeColor, Color hairColor, Location location, String passportID, Country nationality) {
        this.eyeColor = eyeColor;
        this.hairColor = hairColor;
        this.location = location;
        this.passportID = passportID;
        this.nationality = nationality;
    }
}