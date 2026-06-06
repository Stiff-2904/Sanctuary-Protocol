import { pool } from '../config/db.js';

export const processDailyProduction = async (camp_id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // VALIDAR SI YA SE PROCESÓ HOY

    const [[alreadyProcessed]] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM resource_production rp
      JOIN person p
        ON rp.person_id = p.person_id
      WHERE p.camp_id = ?
      AND rp.production_date = CURDATE()
      `,
      [camp_id],
    );

    if (alreadyProcessed.total > 0) {
      throw new Error('Daily production already processed today');
    }

    // PERSONAS ACTIVAS
    const [[activePeople]] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM person
      WHERE camp_id = ?
      AND status = 'active'
      `,
      [camp_id],
    );

    const activeCount = activePeople.total;

    // AGRICULTORES
    const [[farmers]] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM person
      WHERE camp_id = ?
      AND status = 'active'
      AND profession_id = 4
    `,
      [camp_id],
    );

    // RECOLECTORES
    const [[collectors]] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM person
      WHERE camp_id = ?
      AND status = 'active'
      AND profession_id = 6
    `,
      [camp_id],
    );

    const foodProduced = farmers.total * 3;
    const waterProduced = collectors.total * 3;

    const foodConsumed = activeCount;
    const waterConsumed = activeCount;

    const foodNet = foodProduced - foodConsumed;
    const waterNet = waterProduced - waterConsumed;

    // VALIDAR INVENTARIO DISPONIBLE

    const [[waterInventory]] = await connection.query(
      `
  SELECT quantity
  FROM inventory
  WHERE camp_id = ?
  AND resource_id = 1
  `,
      [camp_id],
    );

    const [[foodInventory]] = await connection.query(
      `
  SELECT quantity
  FROM inventory
  WHERE camp_id = ?
  AND resource_id = 2
  `,
      [camp_id],
    );

    const currentWater = Number(waterInventory?.quantity || 0);
    const currentFood = Number(foodInventory?.quantity || 0);

    if (currentWater + waterNet < 0) {
      throw new Error('Insufficient water for daily consumption');
    }

    if (currentFood + foodNet < 0) {
      throw new Error('Insufficient food for daily consumption');
    }

    // COMIDA (resource_id = 2)
    await connection.query(
      `
      UPDATE inventory
      SET quantity = quantity + ?
      WHERE camp_id = ?
      AND resource_id = 2
    `,
      [foodNet, camp_id],
    );

    // AGUA (resource_id = 1)
    await connection.query(
      `
      UPDATE inventory
      SET quantity = quantity + ?
      WHERE camp_id = ?
      AND resource_id = 1
    `,
      [waterNet, camp_id],
    );

    // REGISTRO PRODUCCIÓN AGRICULTORES
    const [farmerRows] = await connection.query(
      `
      SELECT person_id
      FROM person
      WHERE camp_id = ?
      AND profession_id = 4
      AND status = 'active'
    `,
      [camp_id],
    );

    for (const farmer of farmerRows) {
      await connection.query(
        `
        INSERT INTO resource_production
        (
          person_id,
          resource_id,
          quantity_produced,
          production_date
        )
        VALUES (?, 2, 3, CURDATE())
      `,
        [farmer.person_id],
      );
    }

    // REGISTRO PRODUCCIÓN RECOLECTORES
    const [collectorRows] = await connection.query(
      `
      SELECT person_id
      FROM person
      WHERE camp_id = ?
      AND profession_id = 6
      AND status = 'active'
    `,
      [camp_id],
    );

    for (const collector of collectorRows) {
      await connection.query(
        `
        INSERT INTO resource_production
        (
          person_id,
          resource_id,
          quantity_produced,
          production_date
        )
        VALUES (?, 1, 3, CURDATE())
      `,
        [collector.person_id],
      );
    }

    await connection.commit();

    return {
      camp_id,
      active_people: activeCount,

      water_consumed: waterConsumed,
      food_consumed: foodConsumed,

      water_produced: waterProduced,
      food_produced: foodProduced,

      net_water: waterNet,
      net_food: foodNet,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
