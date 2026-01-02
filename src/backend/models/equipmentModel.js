import sql from '../config/database.js';

const equipmentModel = {
  // Create equipment table if it doesn't exist
  createTable: async () => {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS equipment (
          id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
          owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          equipment_name TEXT NOT NULL,
          description TEXT,
          price_per_day NUMERIC(10,2) NOT NULL,
          max_duration_days INTEGER NOT NULL,
          owner_phone TEXT,
          owner_email TEXT,
          status TEXT NOT NULL DEFAULT 'available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('Equipment table created/verified');
    } catch (error) {
      console.error('Error creating equipment table:', error);
      throw error;
    }
  },

  // Get all equipment
  findAll: async () => {
    try {
      const result = await sql`
        SELECT e.*, u.name 
        FROM equipment e 
        LEFT JOIN users u ON e.owner_id = u.id 
        WHERE e.status != 'removed'
        ORDER BY e.created_at DESC
      `;
      return result;
    } catch (error) {
      console.error('Error fetching all equipment:', error);
      throw error;
    }
  },

  // Get equipment by ID
  findById: async (id) => {
    try {
      const result = await sql`
        SELECT e.*, u.name 
        FROM equipment e 
        LEFT JOIN users u ON e.owner_id = u.id 
        WHERE e.id = ${id}
      `;
      return result[0];
    } catch (error) {
      console.error('Error fetching equipment by ID:', error);
      throw error;
    }
  },

  // Get equipment by owner
  findByOwner: async (ownerId) => {
    try {
      const result = await sql`
        SELECT * FROM equipment 
        WHERE owner_id = ${ownerId} AND status != 'removed'
        ORDER BY created_at DESC
      `;
      return result;
    } catch (error) {
      console.error('Error fetching equipment by owner:', error);
      throw error;
    }
  },

  // Create new equipment
  create: async (equipmentData) => {
    try {
      const {
        owner_id,
        equipment_name,
        description,
        price_per_day,
        max_duration_days,
        owner_phone,
        owner_email
      } = equipmentData;

      const result = await sql`
        INSERT INTO equipment (
          owner_id, equipment_name, description, price_per_day, 
          max_duration_days, owner_phone, owner_email, status
        ) VALUES (${owner_id}, ${equipment_name}, ${description}, ${price_per_day}, ${max_duration_days}, ${owner_phone}, ${owner_email}, 'available')
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  },

  // Update equipment
  update: async (id, updateData) => {
    try {
      const {
        equipment_name,
        description,
        price_per_day,
        max_duration_days,
        status
      } = updateData;

      const result = await sql`
        UPDATE equipment 
        SET equipment_name = ${equipment_name}, 
            description = ${description}, 
            price_per_day = ${price_per_day}, 
            max_duration_days = ${max_duration_days}, 
            status = ${status}, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  },

  // Update equipment status
  updateStatus: async (id, status) => {
    try {
      const result = await sql`
        UPDATE equipment 
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error updating equipment status:', error);
      throw error;
    }
  },

  // Delete equipment (soft delete by setting status to 'removed')
  delete: async (id) => {
    try {
      const result = await sql`
        UPDATE equipment 
        SET status = 'removed', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  },

  // Get available equipment
  findAvailable: async () => {
    try {
      const result = await sql`
        SELECT e.*, u.name 
        FROM equipment e 
        LEFT JOIN users u ON e.owner_id = u.id 
        WHERE e.status = 'available'
        ORDER BY e.created_at DESC
      `;
      return result;
    } catch (error) {
      console.error('Error fetching available equipment:', error);
      throw error;
    }
  }
};

export default equipmentModel;
