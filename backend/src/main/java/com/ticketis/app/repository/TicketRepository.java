package com.ticketis.app.repository;

import com.ticketis.app.dto.sql.CoordinatesTicketCount;
import com.ticketis.app.model.Ticket;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>,
        JpaSpecificationExecutor<Ticket> {

    @Query("""
            SELECT new com.ticketis.app.dto.sql.CoordinatesTicketCount(
                COUNT(t.id),
                t.coordinates.id
            )
            FROM Ticket t
            GROUP BY t.coordinates.id
            ORDER BY COUNT(t.id) DESC
            """)
    List<CoordinatesTicketCount> countTicketsGroupedByCoordinates();

    @Query(value = "SELECT COUNT(id) FROM tickets WHERE number = ?1", nativeQuery = true)
    Long countTicketsByNumberEquals(double number);

    @Query(value = "SELECT COUNT(id) FROM tickets WHERE number < ?1", nativeQuery = true)
    Long countTicketsByNumberLess(double number);

    @Modifying
    @Query(value = "UPDATE tickets SET person_id=?1, price=?3 WHERE id = ?2", nativeQuery = true)
    public void sellTicketByPrice(Long buyerId, Long ticketId, Long price);

    @Modifying
    @Query(value = "UPDATE tickets SET person_id = NULL where person_id = ?1", nativeQuery = true)
    public int unbookByPersonId(Long personId);

    @Modifying
    @Query("DELETE FROM Ticket t WHERE t.id = :id")
    int deleteByIdAndReturnCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Ticket t SET t.price = t.price + :price WHERE t.id = :id")
    void increasePriceNative(@Param("id") Long id, @Param("price") Long price);

    boolean existsByName(String name);

    @Query(value = "SELECT EXISTS(SELECT 1 FROM tickets WHERE name = :name AND id != :excludeId)", nativeQuery = true)
    boolean existsByNameExcludingId(@Param("name") String name, @Param("excludeId") Long excludeId);
}