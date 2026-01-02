import sql from '../config/database.js';
import { notificationController } from './notificationController.js';

const createRentalRequest = async (requestData) => {
  const {
    equipment_id,
    requester_id,
    requester_phone,
    requester_email,
    price_per_day_requested,
    requested_duration_days
  } = requestData;

  try {
    // Check if user already has a pending or accepted request for this equipment
    const existingRequest = await sql`
      SELECT id FROM rental_requests 
      WHERE equipment_id = ${equipment_id} 
      AND requester_id = ${requester_id} 
      AND status IN ('pending', 'accepted')
    `;

    if (existingRequest.length > 0) {
      return {
        success: false,
        message: 'You already have a pending or accepted request for this equipment'
      };
    }

    const result = await sql`
      INSERT INTO rental_requests (
        equipment_id, requester_id, requester_phone, requester_email,
        price_per_day_requested, requested_duration_days, status
      ) VALUES (${equipment_id}, ${requester_id}, ${requester_phone}, ${requester_email}, ${price_per_day_requested}, ${requested_duration_days}, 'pending')
      RETURNING *
    `;
    
    return {
      success: true,
      request: result[0],
      message: 'Rental request submitted successfully'
    };
  } catch (error) {
    console.error('Error creating rental request:', error);
    return {
      success: false,
      message: 'Failed to submit rental request'
    };
  }
};

const getRentalRequestsByEquipment = async (equipmentId) => {
  try {
    const result = await sql`
      SELECT rr.*, u.name 
      FROM rental_requests rr 
      LEFT JOIN users u ON rr.requester_id = u.id 
      WHERE rr.equipment_id = ${equipmentId}
      ORDER BY rr.created_at DESC
    `;
    
    return {
      success: true,
      requests: result
    };
  } catch (error) {
    console.error('Error fetching rental requests by equipment:', error);
    return {
      success: false,
      message: 'Failed to fetch rental requests'
    };
  }
};

const acceptRentalRequest = async (requestId, equipmentId) => {
  try {
    // Start a transaction-like operation
    // First, update the request status to accepted
    const requestResult = await sql`
      UPDATE rental_requests 
      SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${requestId}
      RETURNING *
    `;

    if (requestResult.length === 0) {
      return {
        success: false,
        message: 'Rental request not found'
      };
    }

    // Update equipment status to rented
    const equipmentResult = await sql`
      UPDATE equipment 
      SET status = 'rented', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${equipmentId}
      RETURNING *
    `;

    // Reject all other pending requests for this equipment
    await sql`
      UPDATE rental_requests 
      SET status = 'rejected', updated_at = CURRENT_TIMESTAMP 
      WHERE equipment_id = ${equipmentId} AND id != ${requestId} AND status = 'pending'
    `;

    // Get requester details for notification
    const requesterDetails = requestResult[0];

    // Create notification message
    const notificationMessage = `Rental Request Accepted! Your rental request has been accepted. Please contact the owner via phone: ${requesterDetails.requester_phone} or email: ${requesterDetails.requester_email}`;

    // Create notification for the accepted requester using the notification controller
    await notificationController.createNotificationForUser(
      requesterDetails.requester_id,
      'rental',
      notificationMessage
    );
    
    return {
      success: true,
      request: requestResult[0],
      equipment: equipmentResult[0],
      message: 'Rental request accepted successfully'
    };
  } catch (error) {
    console.error('Error accepting rental request:', error);
    return {
      success: false,
      message: 'Failed to accept rental request'
    };
  }
};

const getRentalRequestsByUser = async (userId) => {
  try {
    const result = await sql`
      SELECT rr.*, e.equipment_name, e.owner_phone, e.owner_email 
      FROM rental_requests rr 
      LEFT JOIN equipment e ON rr.equipment_id = e.id 
      WHERE rr.requester_id = ${userId}
      ORDER BY rr.created_at DESC
    `;
    
    return {
      success: true,
      requests: result
    };
  } catch (error) {
    console.error('Error fetching rental requests by user:', error);
    return {
      success: false,
      message: 'Failed to fetch rental requests'
    };
  }
};

export {
  createRentalRequest,
  getRentalRequestsByEquipment,
  acceptRentalRequest,
  getRentalRequestsByUser
};
