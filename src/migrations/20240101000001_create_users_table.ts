import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('email', 100).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('first_name', 50).nullable();
    table.string('last_name', 50).nullable();
    table.string('avatar', 255).nullable();
    table.boolean('is_active').defaultTo(true);
    table.boolean('deleted').defaultTo(false);
    table.timestamps(true, true);

    // Indexes
    table.index(['email']);
    table.index(['username']);
    table.index(['is_active']);
    table.index(['deleted']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
