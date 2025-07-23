import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import * as fs from 'fs';
import * as path from 'path';

// For migrations
async function main() {
  console.log('Running migrations...');
  
  const connectionString = process.env.DATABASE_URL || 'postgres://torevar:hesoyam@postgres:5432/telegram_bot';
  const pool = new Pool({ connectionString });
  
  // Execute the init.sql file first to ensure tables exist
  console.log('Executing init.sql to ensure tables exist...');
  try {
    const initSql = fs.readFileSync(path.join(process.cwd(), 'init.sql'), 'utf8');
    await pool.query(initSql);
    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error executing init.sql:', err);
    throw err;
  }
  
  // Now initialize Drizzle with the schema
  const db = drizzle(pool, { schema });
  
  // Check if migration directory exists
  const migrationsDir = path.join(process.cwd(), 'drizzle');
  const metaDir = path.join(migrationsDir, 'meta');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('Creating migrations directory...');
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  if (!fs.existsSync(metaDir)) {
    console.log('Creating meta directory...');
    fs.mkdirSync(metaDir, { recursive: true });
  }
  
  // Create journal file if it doesn't exist
  const journalPath = path.join(metaDir, '_journal.json');
  if (!fs.existsSync(journalPath)) {
    console.log('Creating journal file...');
    fs.writeFileSync(journalPath, JSON.stringify({ entries: [] }));
  }
  
  try {
    // Try to run migrations if they exist
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations completed successfully');
  } catch (err) {
    console.log('Migration process skipped:', err.message);
  }
  
  // Check if admin user exists
  try {
    const adminExists = await db.query.admins.findFirst({
      where: (admins, { eq }) => eq(admins.username, 'torevar')
    });
    
    if (!adminExists) {
      console.log('Creating admin user...');
      await db.insert(schema.admins).values({
        username: 'torevar',
        password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password'
        role: 'admin'
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Error checking/creating admin user:', err);
  }
  
  console.log('Database setup completed');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
