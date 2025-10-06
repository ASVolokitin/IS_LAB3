package com.ticket_is.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ticket_is.app.dto.sql.CoordinatesTicketCount;
import com.ticket_is.app.model.Ticket;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("""
    SELECT new com.ticket_is.app.dto.sql.CoordinatesTicketCount(
        COUNT(t.id),
        t.coordinates.id
    )
    FROM Ticket t
    GROUP BY t.coordinates.id
    ORDER BY COUNT(t.id) DESC
    """)
    List<CoordinatesTicketCount> countTicketsGroupedByCoordinates();

    @Query(value="SELECT COUNT(id) FROM tickets WHERE number = ?1", nativeQuery = true)
    Long countTicketsByNumberEquals(double number);

    @Query(value="SELECT COUNT(id) FROM tickets WHERE number < ?1", nativeQuery = true)
    Long countTicketsByNumberLess(double number);

    @Modifying
    @Query(value="UPDATE tickets SET person_id=?1, price=?3 WHERE id = ?2", nativeQuery=true)
    public void sellTicketByPrice(Long buyerId, Long ticketId, Long price);

    @Modifying
    @Query(value="UPDATE tickets SET person_id = NULL where person_id = ?1", nativeQuery=true)
    public int unbookByPersonId(Long personId);
}