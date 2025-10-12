import { EntityData } from '../../../../types/ConnectedObject';

interface EntityCardProps {
  entity: EntityData;
  onEdit: (entity: EntityData) => void;
  onDelete: (id: number, type: EntityData['type']) => void;
}

export const EntityCard = ({ 
  entity, 
  onEdit, 
  onDelete 
}: EntityCardProps) => {
  return (
    <div className="entity-card">
      <div className="card-header">
        <h3 className="card-title">{entity.title}</h3>
        <span className="card-badge">{entity.type}</span>
      </div>
      
      <div className="card-content">
        <p className="card-description">{entity.description}</p>
        
        <div className="card-details">
          {Object.entries(entity.data).map(([key, value]) => (
            <div key={key} className="detail-item">
              <span className="detail-label">{key}:</span>
              <span className="detail-value">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-actions">
        <button className="edit-button" onClick={() => onEdit(entity)}>
          Update
        </button>
        
        <button className="delete-button" onClick={() => onDelete(entity.id, entity.type)}>
          Delete
        </button>
      </div>
    </div>
  );
};