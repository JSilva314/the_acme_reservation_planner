//client - a node pg client

const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://localhost/the_acme_reservation_planner_db"
);
const uuid = require("uuid");

//createTables method - drops and creates the tables for your application

const createTables = async () => {
  const SQL = /*sql*/ `
    DROP TABLE IF EXISTS reservation;
    DROP TABLE IF EXISTS restaurant;
    DROP TABLE IF EXISTS customer;
    CREATE TABLE customer(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE restaurant(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE reservation(
        id UUID PRIMARY KEY,
        reservation_date DATE NOT NULL,
        party_count INTEGER NOT NULL,
        restaurant_id UUID REFERENCES restaurant(id) NOT NULL,
        customer_id UUID REFERENCES customer(id) NOT NULL

    );
    `;
  await client.query(SQL);
};

//createCustomer - creates a customer in the database and returns the created record

const createCustomer = async (name) => {
  const SQL = /*SQL*/ `
    INSERT INTO customer(id, name) VALUES($1, $2) RETURNING *`;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

//createRestaurant - creates a restaurant in the database and returns the created record

const createRestaurant = async (name) => {
  const SQL = /*SQL*/ `
      INSERT INTO restaurant(id, name) VALUES($1, $2) RETURNING *`;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

//fetchCustomer - returns an array of customers in the database

const fetchCustomer = async () => {
  const SQL = /*SQL*/ `
    SELECT *
    FROM customer `;
  const response = await client.query(SQL);
  return response.rows;
};

//fetchRestaurant - returns an array of restaurants in the database

const fetchRestaurant = async () => {
  const SQL = /*SQL*/ `
    SELECT *
    FROM restaurant `;
  const response = await client.query(SQL);
  return response.rows;
};

//createReservation - creates a reservation in the database and returns the created record

const createReservation = async ({
  reservation_date,
  party_count,
  restaurant_id,
  customer_id,
}) => {
  const SQL = /*SQL*/ `
    INSERT INTO reservation(id, reservation_date, party_count, restaurant_id, customer_id ) VALUES ($1, $2, $3, $4, $5) RETURNING * `;
  const response = await client.query(SQL, [
    uuid.v4(),
    reservation_date,
    party_count,
    restaurant_id,
    customer_id,
  ]);
  return response.rows[0];
};

//fetchReservation

const fetchReservation = async () => {
  const SQL = /*SQL*/ `
    SELECT *
    FROM reservation`;
  const response = await client.query(SQL);
  return response.rows;
};

//deleteReservation - deletes a reservation in the database

const deleteReservation = async (id, customer_id) => {
  console.log(id, customer_id);
  const SQL = /*SQL*/ `
    DELETE FROM reservation
    WHERE id = $1 AND customer_id = $2
    `;
  await client.query(SQL, [id, customer_id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomer,
  fetchRestaurant,
  fetchReservation,
  deleteReservation,
};
