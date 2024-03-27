const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomer,
  fetchRestaurant,
  fetchReservation,
  deleteReservation,
} = require("./db");
const express = require("express");
const app = express();
app.use(express.json());

//GET /api/customers - returns array of customers

app.get("/api/customer", async (req, res, next) => {
  try {
    res.send(await fetchCustomer());
  } catch (ex) {
    next(ex);
  }
});

//GET /api/restaurant - returns an array of restaurants

app.get("/api/restaurant", async (req, res, next) => {
  try {
    res.send(await fetchRestaurant());
  } catch (ex) {
    next(ex);
  }
});

//GET /api/reservations - returns an array of reservations

app.get("/api/reservation", async (req, res, next) => {
  try {
    res.send(await fetchReservation());
  } catch (ex) {
    next(ex);
  }
});
//POST /api/customer/:id/reservations - payload: an object which has a valid restaurant_id, date, and party_count. Returns the created reservation with a status code of 201

app.post("/api/customer/:customer_id/reservation", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        customer_id: req.params.customer_id,
        restaurant_id: req.body.restaurant_id,
        party_count: req.body.party_count,
        reservation_date: req.body.reservation_date,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

//DELETE /api/customers/:customer_id/reservations/:id - the id of the reservation to delete and the customer_id is passed in the URL, returns nothing with a status code of 204

app.delete(
  "/api/customer/:customer_id/reservation/:id",
  async (req, res, next) => {
    try {
      await deleteReservation(req.params.id, req.params.customer_id);
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);
const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("created tables");

  const [michealangelo, donatello, leonardo, raphael, chilis, tgif, ihop] =
    await Promise.all([
      createCustomer({ name: "michaelangelo" }),
      createCustomer({ name: "donatello" }),
      createCustomer({ name: "leonardo" }),
      createCustomer({ name: "raphael" }),
      createRestaurant({ name: "chilis" }),
      createRestaurant({ name: "tgif" }),
      createRestaurant({ name: "ihop" }),
    ]);
  console.log(await fetchCustomer());
  console.log(await fetchRestaurant());

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      customer_id: leonardo.id,
      party_count: 4,
      restaurant_id: tgif.id,
      reservation_date: "03/14/1987",
    }),
    createReservation({
      customer_id: donatello.id,
      party_count: 2,
      restaurant_id: ihop.id,
      reservation_date: "04/16/1993",
    }),
  ]);
  console.log(await fetchReservation());
  await deleteReservation(reservation.id, reservation.customer_id);
  console.log(await fetchReservation());

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log("some curl commands to test");
    console.log(`curl localhost:${port}/api/customer`);
    console.log(`curl localhost:${port}/api/restaurant`);
    console.log(`curl localhost:${port}/api/reservation`);
    console.log(
      `curl -X DELETE localhost:${port}/api/customer/${leonardo.id}/reservation/${reservation2.id}`
    );
    console.log(
      `curl -X POST localhost:${port}/api/customer/${michealangelo.id}/reservation/ -d '{"restaurant_id":"${ihop.id}", "reservation_date": "03/14/1987"}' -H "Content-Type:application/json"`
    );
  });
};

init();
