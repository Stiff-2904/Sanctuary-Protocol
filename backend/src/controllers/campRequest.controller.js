import { createCampRequest } from '../models/campRequest.model.js';
import { addResourceToRequest } from '../models/campRequest.model.js';
import { addPersonToRequest } from '../models/campRequest.model.js';
import { approveCampRequest } from '../models/campRequest.model.js';
import { rejectCampRequest } from '../models/campRequest.model.js';
import { getCampRequests } from '../models/campRequest.model.js';
import { pool } from '../config/db.js';

export const createCampRequestController = async (req, res) => {
  try {
    const {
      target_camp_id,
      type,
      source_camp_id: bodyCampId,
      expedition_days,
      expedition_location,
    } = req.body;

    const source_camp_id =
      req.user.role === 'SuperAdmin'
        ? req.user.camp_id || bodyCampId
        : req.user.camp_id;

    if (!source_camp_id) {
      return res.status(400).json({
        message:
          'No hay campamento seleccionado. Seleccioná un campamento antes de crear una solicitud.',
      });
    }

    if (!target_camp_id && type !== 'expedition') {
      return res.status(400).json({
        message: 'target_camp_id is required',
      });
    }

    if (type === 'expedition') {
      if (!expedition_days || expedition_days < 1) {
        return res.status(400).json({
          message: 'Las expediciones deben tener al menos 1 día',
        });
      }
    }

    const result = await createCampRequest({
      source_camp_id,
      target_camp_id: type === 'expedition' ? source_camp_id : target_camp_id,
      type,
      expedition_days,
      expedition_location,
      status: 'pending',
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating camp request',
      error: error.message,
    });
  }
};

export const addResourceController = async (req, res) => {
  try {
    const result = await addResourceToRequest({
      request_id: req.params.id,
      ...req.body,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error adding resource',
      error: error.message,
    });
  }
};

export const addPersonController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { request_id } = req.params;
    const { person_id } = req.body;

    const [requests] = await connection.query(
      `SELECT cr.*, c.expedition_days 
       FROM camp_request cr
       LEFT JOIN camp_request_expedition c ON cr.request_id = c.request_id
       WHERE cr.request_id = ?`,
      [request_id],
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const request = requests[0];
    const isExpedition = request.type === 'expedition';
    let foodNeeded = null;
    let waterNeeded = null;
    let totalDays = null;

    const result = await addPersonToRequest({
      request_id,
      person_id,
    });

    if (isExpedition && request.expedition_days) {
      const extraDays = 2;
      totalDays = parseInt(request.expedition_days) + extraDays;

      const foodPerPersonPerDay = 2;
      const waterPerPersonPerDay = 3;

      foodNeeded = foodPerPersonPerDay * totalDays;
      waterNeeded = waterPerPersonPerDay * totalDays;

      const [inventory] = await connection.query(
        `SELECT resource_id, quantity 
         FROM inventory 
         WHERE camp_id = ? AND resource_type IN ('food', 'water')`,
        [request.source_camp_id],
      );

      const foodAvailable =
        inventory.find((i) => i.resource_type === 'food')?.quantity || 0;
      const waterAvailable =
        inventory.find((i) => i.resource_type === 'water')?.quantity || 0;

      if (foodAvailable < foodNeeded || waterAvailable < waterNeeded) {
        await connection.rollback();
        return res.status(400).json({
          message: 'Recursos insuficientes para la expedición',
          details: {
            food_needed: foodNeeded,
            food_available: foodAvailable,
            water_needed: waterNeeded,
            water_available: waterAvailable,
            days: totalDays,
          },
        });
      }

      await connection.query(
        `UPDATE inventory 
         SET quantity = quantity - ?
         WHERE camp_id = ? AND resource_type = 'food'`,
        [foodNeeded, request.source_camp_id],
      );

      await connection.query(
        `UPDATE inventory 
         SET quantity = quantity - ?
         WHERE camp_id = ? AND resource_type = 'water'`,
        [waterNeeded, request.source_camp_id],
      );

      await connection.query(
        `INSERT INTO camp_request_expedition_resources 
         (request_id, person_id, food_reserved, water_reserved, days)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           food_reserved = ?,
           water_reserved = ?`,
        [
          request_id,
          person_id,
          foodNeeded,
          waterNeeded,
          totalDays,
          foodNeeded,
          waterNeeded,
        ],
      );

      await connection.query(
        `INSERT INTO audit_log (action, details, camp_id, created_at)
         VALUES ('expedition_resources_reserved', ?, ?, NOW())`,
        [
          JSON.stringify({
            request_id,
            person_id,
            food: foodNeeded,
            water: waterNeeded,
            days: totalDays,
          }),
          request.source_camp_id,
        ],
      );
    }

    await connection.commit();

    res.json({
      ...result,
      expedition_info: isExpedition
        ? {
            days: request.expedition_days,
            food_reserved: isExpedition ? foodNeeded : null,
            water_reserved: isExpedition ? waterNeeded : null,
          }
        : null,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: 'Error adding person',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};
export const approveCampRequestController = async (req, res) => {
  try {
    const result = await approveCampRequest(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error approving request',
      error: error.message,
    });
  }
};

export const rejectCampRequestController = async (req, res) => {
  try {
    const result = await rejectCampRequest(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error rejecting request',
      error: error.message,
    });
  }
};

export const getCampRequestsController = async (req, res) => {
  try {
    const camp_id = req.user.camp_id || req.query.camp_id;
    const requests = await getCampRequests(camp_id);
    res.json(requests);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching camp requests', error: error.message });
  }
};

export const completeExpeditionController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { request_id } = req.params;
    const { food_brought, water_brought, other_resources, notes } = req.body;

    const [requests] = await connection.query(
      `SELECT cr.*, cre.food_reserved, cre.water_reserved
       FROM camp_request cr
       LEFT JOIN camp_request_expedition_resources cre ON cr.request_id = cre.request_id
       WHERE cr.request_id = ? AND cr.type = 'expedition'`,
      [request_id],
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Expedición no encontrada' });
    }

    const expedition = requests[0];

    if (expedition.status !== 'approved') {
      return res.status(400).json({
        message: 'Solo se pueden completar expediciones aprobadas',
      });
    }

    if (food_brought > 0) {
      await connection.query(
        `UPDATE inventory 
         SET quantity = quantity + ?
         WHERE camp_id = ? AND resource_type = 'food'`,
        [food_brought, expedition.source_camp_id],
      );
    }

    if (water_brought > 0) {
      await connection.query(
        `UPDATE inventory 
         SET quantity = quantity + ?
         WHERE camp_id = ? AND resource_type = 'water'`,
        [water_brought, expedition.source_camp_id],
      );
    }

    if (other_resources && other_resources.length > 0) {
      for (const resource of other_resources) {
        await connection.query(
          `INSERT INTO inventory (camp_id, resource_type, quantity, created_at, updated_at)
           VALUES (?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE 
             quantity = quantity + ?,
             updated_at = NOW()`,
          [
            expedition.source_camp_id,
            resource.type,
            resource.quantity,
            resource.quantity,
          ],
        );
      }
    }

    await connection.query(
      `UPDATE camp_request 
       SET status = 'completed', completed_at = NOW()
       WHERE request_id = ?`,
      [request_id],
    );

    await connection.query(
      `UPDATE person p
       JOIN camp_request_person crp ON p.person_id = crp.person_id
       SET p.status = 'active'
       WHERE crp.request_id = ?`,
      [request_id],
    );

    await connection.query(
      `INSERT INTO audit_log (action, details, camp_id, created_at)
       VALUES ('expedition_completed', ?, ?, NOW())`,
      [
        JSON.stringify({
          request_id,
          food_brought,
          water_brought,
          other_resources,
          notes,
          food_reserved: expedition.food_reserved,
          water_reserved: expedition.water_reserved,
          net_gain: {
            food: (food_brought || 0) - (expedition.food_reserved || 0),
            water: (water_brought || 0) - (expedition.water_reserved || 0),
          },
        }),
        expedition.source_camp_id,
      ],
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Expedición completada exitosamente',
      data: {
        request_id,
        resources_brought: {
          food: food_brought || 0,
          water: water_brought || 0,
          other: other_resources || [],
        },
        net_gain: {
          food: (food_brought || 0) - (expedition.food_reserved || 0),
          water: (water_brought || 0) - (expedition.water_reserved || 0),
        },
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error completing expedition:', error);
    res.status(500).json({
      message: 'Error completing expedition',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};
