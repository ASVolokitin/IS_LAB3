package com.ticketis.app.repository;

import com.ticketis.app.model.Coordinates;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface  CoordinatesRepository extends JpaRepository<Coordinates, Long> {

    public void deleteCoordinatesById(Long id);
}
