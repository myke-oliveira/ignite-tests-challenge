import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import request from "supertest";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Get statement operation controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("get statement operation user password", 8);

    await connection.query(
      `INSERT INTO users (id, name, email, password)
      VALUES('${id}', 'get statement operation user', 'getstatementoperationuser@finapi.com.br', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement operation", async () => {
    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "getstatementoperationuser@finapi.com.br",
        password: "get statement operation user password",
      });

    const token = authenticationResponse.body.token;

    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Deposit description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.statement).toHaveLength(3);
    expect(response.body.balance).toBe(350);
  });
});
