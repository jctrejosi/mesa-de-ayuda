import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'helpdesk',
    password: 'helpdesk',
    database: 'helpdesk',
  });

  const [rows] = await conn.query('SELECT 1');
  console.log(rows);

  await conn.end();
}

main().catch(console.error);
