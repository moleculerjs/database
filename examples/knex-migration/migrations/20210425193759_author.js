exports.up = function (knex) {
	return knex.schema.alterTable("posts", table => {
		table.integer("author");
	});
};

exports.down = function (knex) {
	return knex.schema.alterTable("posts", table => {
		table.dropColumn("author");
	});
};
