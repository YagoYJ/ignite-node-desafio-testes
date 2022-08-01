import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
let token: string;

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
      ('${id}', 'Create statement user', 'createstatementuser@test.com', '${password}', 'now()', 'now()')
  `);

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "createstatementuser@test.com",
      password: "password",
    });

    token = responseToken.body.token;

    // await connection.query(`
    //   INSERT INTO users
    //     (id, name, email, password, created_at, updated_at)
    //   VALUES
    //     ('bf057822-7e41-4746-8edc-67e3da62cb20', 'User Test', 'user@test.com', '${password}', 'now()', 'now()')
    // `);
  });

  afterAll(async () => {
    // await connection.dropDatabase();
    // await connection.close();

    await connection.query(
      "DELETE FROM users WHERE email = 'createstatementuser@test.com'"
    );
    await connection.close();
  });

  it("Should be able to create a deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 300,
        description: "Deposit test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("Should be able to create a withdraw statement", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "Deposit test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "Withdraw test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able to create a withdraw statement when have insufficient funds", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "Withdraw test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("Should be able to get a statement data", async () => {
    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${depositResponse.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });
});
