import { pool } from '../config/db.js';

// ── Reglas de negocio 
const PROFESSION_FARMER = 4;       // Agricultor → produce comida
const PROFESSION_COLLECTOR = 6;    // Recolector → produce agua
const RESOURCE_WATER = 1;
const RESOURCE_FOOD = 2;
const PRODUCTION_PER_WORKER = 3;   // unidades producidas por trabajador/día
const CONSUMPTION_PER_PERSON = 1;  // unidades consumidas por persona/día

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
      AND profession_id = ?
    `,
      [camp_id, PROFESSION_FARMER],
    );

    // RECOLECTORES
    const [[collectors]] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM person
      WHERE camp_id = ?
      AND status = 'active'
      AND profession_id = ?
    `,
      [camp_id, PROFESSION_COLLECTOR],
    );

    const foodProduced = farmers.total * PRODUCTION_PER_WORKER;
    const waterProduced = collectors.total * PRODUCTION_PER_WORKER;

    const foodConsumed = activeCount * CONSUMPTION_PER_PERSON;
    const waterConsumed = activeCount * CONSUMPTION_PER_PERSON;

    const foodNet = foodProduced - foodConsumed;
    const waterNet = waterProduced - waterConsumed;

    // VALIDAR INVENTARIO DISPONIBLE
    const [[waterInventory]] = await connection.query(
      `
      SELECT quantity
      FROM inventory
      WHERE camp_id = ?
      AND resource_id = ?
      `,
      [camp_id, RESOURCE_WATER],
    );

    const [[foodInventory]] = await connection.query(
      `
      SELECT quantity
      FROM inventory
      WHERE camp_id = ?
      AND resource_id = ?
      `,
      [camp_id, RESOURCE_FOOD],
    );

    const currentWater = Number(waterInventory?.quantity || 0);
    const currentFood = Number(foodInventory?.quantity || 0);

    if (currentWater + waterNet < 0) {
      throw new Error('Insufficient water for daily consumption');
    }

    if (currentFood + foodNet < 0) {
      throw new Error('Insufficient food for daily consumption');
    }

    // COMIDA
    await connection.query(
      `
      UPDATE inventory
      SET quantity = quantity + ?
      WHERE camp_id = ?
      AND resource_id = ?
    `,
      [foodNet, camp_id, RESOURCE_FOOD],
    );

    // AGUA
    await connection.query(
      `
      UPDATE inventory
      SET quantity = quantity + ?
      WHERE camp_id = ?
      AND resource_id = ?
    `,
      [waterNet, camp_id, RESOURCE_WATER],
    );

    // REGISTRO PRODUCCIÓN AGRICULTORES
    const [farmerRows] = await connection.query(
      `
      SELECT person_id
      FROM person
      WHERE camp_id = ?
      AND profession_id = ?
      AND status = 'active'
    `,
      [camp_id, PROFESSION_FARMER],
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
        VALUES (?, ?, ?, CURDATE())
      `,
        [farmer.person_id, RESOURCE_FOOD, PRODUCTION_PER_WORKER],
      );
    }

    // REGISTRO PRODUCCIÓN RECOLECTORES
    const [collectorRows] = await connection.query(
      `
      SELECT person_id
      FROM person
      WHERE camp_id = ?
      AND profession_id = ?
      AND status = 'active'
    `,
      [camp_id, PROFESSION_COLLECTOR],
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
        VALUES (?, ?, ?, CURDATE())
      `,
        [collector.person_id, RESOURCE_WATER, PRODUCTION_PER_WORKER],
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