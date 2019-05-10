
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('projects', function (table) {
      table.dropColumn('desc');
    })
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('projects', function (table) {
      table.string('desc');
    })
  ]);
};