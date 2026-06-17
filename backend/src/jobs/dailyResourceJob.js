import cron from 'node-cron';
import { pool } from '../config/db.js';

export const startDailyResourceJob = () => {
  cron.schedule(
    '0 0 * * *',
    async () => {
      console.log('[JOB] Iniciando cálculo diario de recursos...');
      await processDailyResources();
    },
    {
      scheduled: true,
      timezone: 'America/Costa_Rica',
    },
  );

  console.log('Job diario de recursos programado (00:00)');
};

export const processDailyResources = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [camps] = await connection.query(
      'SELECT camp_id, name FROM camp WHERE status = "active"',
    );

    if (camps.length === 0) {
      console.log('[JOB] No hay campamentos activos');
      await connection.commit();
      return;
    }

    for (const camp of camps) {
      await processCampResources(connection, camp.camp_id, camp.name);
    }

    await connection.commit();
    console.log('[JOB] Cálculo diario completado');
  } catch (error) {
    await connection.rollback();
    console.error('[JOB] Error:', error);
  } finally {
    connection.release();
  }
};

const processCampResources = async (connection, campId, campName) => {
  console.log(`\nProcesando campamento: ${campName} (ID: ${campId})`);

  const [persons] = await connection.query(
    `SELECT p.person_id, p.name as person_name, pr.name as profession_name
     FROM person p
     LEFT JOIN profession pr ON p.profession_id = pr.profession_id
     WHERE p.camp_id = ? AND p.status = 'active'`,
    [campId],
  );

  if (persons.length === 0) {
    console.log(`  No hay personas activas en ${campName}`);
    return;
  }

  console.log(`  Personas activas: ${persons.length}`);

  const productionRates = {
    Agricultor: { Comida: 5, Agua: 2 },
    Cazador: { Comida: 8 },
    Recolector: { Comida: 3, Agua: 5 },
    Cocinero: { Comida: 3, Agua: 3 },
    Médico: { Medicina: 2 },
    Constructor: { Materiales: 3 },
    'Trabajador general': { Comida: 2, Agua: 2 },
  };

  let totalProduction = {};

  for (const person of persons) {
    const rate =
      productionRates[person.profession_name] ||
      productionRates['Trabajador general'];

    for (const [resourceName, quantity] of Object.entries(rate)) {
      const [resources] = await connection.query(
        'SELECT resource_id FROM resource WHERE LOWER(name) = LOWER(?)',
        [resourceName],
      );

      if (resources.length > 0) {
        const resourceId = resources[0].resource_id;

        await connection.query(
          `INSERT INTO resource_production 
           (person_id, resource_id, quantity_produced, production_date)
           VALUES (?, ?, ?, CURDATE())`,
          [person.person_id, resourceId, quantity],
        );

        totalProduction[resourceId] =
          (totalProduction[resourceId] || 0) + quantity;
      }
    }
  }

  console.log(`  Producción total:`, totalProduction);

  const [foodResource] = await connection.query(
    "SELECT resource_id FROM resource WHERE LOWER(name) = 'comida'",
  );
  const [waterResource] = await connection.query(
    "SELECT resource_id FROM resource WHERE LOWER(name) = 'agua'",
  );

  const totalConsumption = {};

  if (foodResource.length > 0) {
    totalConsumption[foodResource[0].resource_id] = persons.length * 2;
  }
  if (waterResource.length > 0) {
    totalConsumption[waterResource[0].resource_id] = persons.length * 3;
  }

  console.log(`  Consumo total:`, totalConsumption);

  const allResourceIds = new Set([
    ...Object.keys(totalProduction),
    ...Object.keys(totalConsumption),
  ]);

  for (const resourceId of allResourceIds) {
    const produced = totalProduction[resourceId] || 0;
    const consumed = totalConsumption[resourceId] || 0;
    const netChange = produced - consumed;

    await connection.query(
      `INSERT INTO inventory (camp_id, resource_id, quantity, minimum_quantity)
       VALUES (?, ?, GREATEST(0, ?), 50)
       ON DUPLICATE KEY UPDATE 
         quantity = GREATEST(0, quantity + ?)`,
      [campId, resourceId, netChange, netChange],
    );

    console.log(
      `  Resource ${resourceId}: +${produced} -${consumed} = ${netChange}`,
    );
  }

  console.log(`  Campamento ${campName} procesado correctamente`);
};

export default startDailyResourceJob;
