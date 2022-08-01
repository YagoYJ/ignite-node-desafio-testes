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
        ('${id}', 'Show User Profile', 'showuserprofile@test.com', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    // await connection.dropDatabase();
    // await connection.close();

    await connection.query(
      "DELETE FROM users WHERE email = 'showuserprofile@test.com'"
    );
    await connection.close();
  });

  it("Should be able to get a user profile", async () => {
    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "showuserprofile@test.com",
      password: "password",
    });

    const { token } = authResponse.body;

    const profileResponse = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(profileResponse.status).toBe(200);
  });

  it("Should not be able to get user profile with invalid user", async () => {
    const profileResponse = await request(app).get("/api/v1/profile").set({
      Authorization: "Bearer invalid_token",
    });

    expect(profileResponse.status).toBe(401);
  });
});
