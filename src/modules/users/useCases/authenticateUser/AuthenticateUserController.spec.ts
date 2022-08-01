import request from "supertest";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import { Connection } from "typeorm";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("password", 8);

    await connection.query(
      `INSERT INTO users
      (id, name, email, password, created_at, updated_at)
    VALUES
      ('${id}', 'Name Test', 'authenticateuser@test.com', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    // await connection.dropDatabase();
    // await connection.close();

    await connection.query(
      "DELETE FROM users WHERE email = 'authenticateuser@test.com'"
    );
    await connection.close();
  });

  it("Should be able to authenticate a user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "authenticateuser@test.com",
      password: "password",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("Should not be able to authenticate a user with invalid email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "invalid_email@test.com",
      password: "password",
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate a user with invalid password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "authenticateuser@test.com",
      password: "invalid_password",
    });

    expect(response.status).toBe(401);
  });
});
