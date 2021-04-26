exports.up = function (knex) {
	return knex.schema.createTable("posts", table => {
		table.increments("id");
		table.string("title");
		table.string("content");
		table.integer("votes");
		table.boolean("status");
		table.bigInteger("createdAt");
		table.bigInteger("updatedAt");
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable("posts");
};
