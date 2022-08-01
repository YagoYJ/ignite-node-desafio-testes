import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("password", 8);

    await connection.query(`
    INSERT INTO users
      (id, name, email, password, created_at, updated_at)
    VALUES
      ('${id}', 'Create statement user', 'getbalance@test.com', '${password}', 'now()', 'now()')
  `);
  });

  afterAll(async () => {
    // await connection.dropDatabase();
    // await connection.close();

    await connection.query(
      "DELETE FROM users WHERE email = 'getbalance@test.com'"
    );
    await connection.close();
  });

  it("Should be able to get the statements balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "getbalance@test.com",
      password: "password",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("statement");
  });

  it("Should not be able to get the statements balance with a invalid token", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: "Bearer invalid_token",
    });

    expect(response.status).toBe(401);
  });
});
