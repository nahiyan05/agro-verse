import sql from '../config/database.js';

const getEquipment = async () => {
  try {
    const result = await sql`
      SELECT e.*, u.name 
      FROM equipment e 
      LEFT JOIN users u ON e.owner_id = u.id 
      WHERE e.status != 'removed'
      ORDER BY e.created_at DESC
    `;
    
    return {
      success: true,
      equipment: result
    };
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return {
      success: false,
      message: 'Failed to fetch equipment'
    };
  }
};

const getEquipmentByOwner = async (ownerId) => {
  try {
    const result = await sql`
      SELECT * FROM equipment 
      WHERE owner_id = ${ownerId} AND status != 'removed'
      ORDER BY created_at DESC
    `;
    
    return {
      success: true,
      equipment: result
    };
  } catch (error) {
    console.error('Error fetching equipment by owner:', error);
    return {
      success: false,
      message: 'Failed to fetch equipment'
    };
  }
};

const createEquipment = async (equipmentData) => {
  const {
    owner_id,
    equipment_name,
    description,
    price_per_day,
    max_duration_days,
    owner_phone,
    owner_email
  } = equipmentData;

  try {
    const result = await sql`
      INSERT INTO equipment (
        owner_id, equipment_name, description, price_per_day, 
        max_duration_days, owner_phone, owner_email, status
      ) VALUES (${owner_id}, ${equipment_name}, ${description}, ${price_per_day}, ${max_duration_days}, ${owner_phone}, ${owner_email}, 'available')
      RETURNING *
    `;
    
    return {
      success: true,
      equipment: result[0],
      message: 'Equipment added successfully'
    };
  } catch (error) {
    console.error('Error creating equipment:', error);
    return {
      success: false,
      message: 'Failed to add equipment'
    };
  }
};

const updateEquipmentStatus = async (equipmentId, status) => {
  try {
    const result = await sql`
      UPDATE equipment 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${equipmentId}
      RETURNING *
    `;
    
    return {
      success: true,
      equipment: result[0]
    };
  } catch (error) {
    console.error('Error updating equipment status:', error);
    return {
      success: false,
      message: 'Failed to update equipment status'
    };
  }
};

export {
  getEquipment,
  getEquipmentByOwner,
  createEquipment,
  updateEquipmentStatus
};
