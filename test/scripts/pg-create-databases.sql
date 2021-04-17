CREATE DATABASE bench_test;
CREATE DATABASE db_int_test;
CREATE DATABASE db_int_posts_1000;
CREATE DATABASE db_int_posts_1001;
CREATE DATABASE db_int_posts_1002;
CREATE DATABASE db_int_posts_1003;

\connect db_int_test;
CREATE SCHEMA tenant_1000;
CREATE SCHEMA tenant_1001;
CREATE SCHEMA tenant_1002;
CREATE SCHEMA tenant_1003;
