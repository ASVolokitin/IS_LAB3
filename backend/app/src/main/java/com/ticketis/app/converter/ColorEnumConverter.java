package com.ticketis.app.converter;

import com.ticketis.app.model.enums.Color;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class ColorEnumConverter implements AttributeConverter<Color, String> {

    @Override
    public String convertToDatabaseColumn(Color attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public Color convertToEntityAttribute(String dbData) {
        return dbData == null ? null : Color.valueOf(dbData);
    }
}