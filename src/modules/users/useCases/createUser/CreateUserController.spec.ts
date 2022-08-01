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
  });

  afterAll(async () => {
    // await connection.dropDatabase();
    // await connection.close();

    await connection.query(
      "DELETE FROM users WHERE email = 'createuser@test.com'"
    );
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "New User",
      email: "createuser@test.com",
      password: "password",
    });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a already existent user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "New User",
      email: "createuser@test.com",
      password: "password",
    });

    expect(response.status).toBe(400);
  });
});
