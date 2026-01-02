import sql from '../config/database.js';

const rentalRequestModel = {
  // Create rental_requests table if it doesn't exist
  createTable: async () => {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS rental_requests (
          id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
          equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
          requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          requester_phone TEXT,
          requester_email TEXT,
          price_per_day_requested NUMERIC(10,2) NOT NULL,
          requested_duration_days INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('Rental requests table created/verified');
    } catch (error) {
      console.error('Error creating rental requests table:', error);
      throw error;
    }
  },

  // Create new rental request
  create: async (requestData) => {
    try {
      const {
        equipment_id,
        requester_id,
        requester_phone,
        requester_email,
        price_per_day_requested,
        requested_duration_days
      } = requestData;

      // Check if user already has a pending or accepted request for this equipment
      const existingRequest = await sql`
        SELECT id FROM rental_requests 
        WHERE equipment_id = ${equipment_id} 
        AND requester_id = ${requester_id} 
        AND status IN ('pending', 'accepted')
      `;

      if (existingRequest.length > 0) {
        throw new Error('You already have a pending or accepted request for this equipment');
      }

      const result = await sql`
        INSERT INTO rental_requests (
          equipment_id, requester_id, requester_phone, requester_email,
          price_per_day_requested, requested_duration_days, status
        ) VALUES (${equipment_id}, ${requester_id}, ${requester_phone}, ${requester_email}, ${price_per_day_requested}, ${requested_duration_days}, 'pending')
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error creating rental request:', error);
      throw error;
    }
  },

  // Get all rental requests
  findAll: async () => {
    try {
      const result = await sql`
        SELECT rr.*, e.equipment_name, e.owner_id, u.name 
        FROM rental_requests rr 
        LEFT JOIN equipment e ON rr.equipment_id = e.id 
        LEFT JOIN users u ON rr.requester_id = u.id 
        ORDER BY rr.created_at DESC
      `;
      return result;
    } catch (error) {
      console.error('Error fetching all rental requests:', error);
      throw error;
    }
  },

  // Get rental request by ID
  findById: async (id) => {
    try {
      const result = await sql`
        SELECT rr.*, e.equipment_name, e.owner_id, u.name 
        FROM rental_requests rr 
        LEFT JOIN equipment e ON rr.equipment_id = e.id 
        LEFT JOIN users u ON rr.requester_id = u.id 
        WHERE rr.id = ${id}
      `;
      return result[0];
    } catch (error) {
      console.error('Error fetching rental request by ID:', error);
      throw error;
    }
  },

  // Get rental requests by equipment
  findByEquipment: async (equipmentId) => {
    try {
      const result = await sql`
        SELECT rr.*, u.name 
        FROM rental_requests rr 
        LEFT JOIN users u ON rr.requester_id = u.id 
        WHERE rr.equipment_id = ${equipmentId}
        ORDER BY rr.created_at DESC
      `;
      return result;
    } catch (error) {
      console.error('Error fetching rental requests by equipment:', error);
      throw error;
    }
  },

  // Get rental requests by requester
  findByRequester: async (requesterId) => {
    try {
      const result = await sql`
        SELECT rr.*, e.equipment_name, e.owner_phone, e.owner_email 
        FROM rental_requests rr 
        LEFT JOIN equipment e ON rr.equipment_id = e.id 
        WHERE rr.requester_id = ${requesterId}
        ORDER BY rr.created_at DESC
      `;
      return result;
    } catch (error) {
      console.error('Error fetching rental requests by requester:', error);
      throw error;
    }
  },

  // Update rental request status
  updateStatus: async (id, status) => {
    try {
      const result = await sql`
        UPDATE rental_requests 
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error updating rental request status:', error);
      throw error;
    }
  },

  // Accept rental request
  accept: async (id) => {
    try {
      const result = await sql`
        UPDATE rental_requests 
        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error accepting rental request:', error);
      throw error;
    }
  },

  // Reject rental request
  reject: async (id) => {
    try {
      const result = await sql`
        UPDATE rental_requests 
        SET status = 'rejected', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error rejecting rental request:', error);
      throw error;
    }
  },

  // Get pending requests for equipment owner
  findPendingByOwner: async (ownerId) => {
    try {
      const result = await sql`
        SELECT rr.*, e.equipment_name, u.name 
        FROM rental_requests rr 
        LEFT JOIN equipment e ON rr.equipment_id = e.id 
        LEFT JOIN users u ON rr.requester_id = u.id 
        WHERE e.owner_id = ${ownerId} AND rr.status = 'pending'
        ORDER BY rr.created_at DESC
      `;
      return result;
    } catch (error) {
      console.error('Error fetching pending requests by owner:', error);
      throw error;
    }
  },

  // Cancel rental request
  cancel: async (id) => {
    try {
      const result = await sql`
        UPDATE rental_requests 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error cancelling rental request:', error);
      throw error;
    }
  }
};

export default rentalRequestModel;
