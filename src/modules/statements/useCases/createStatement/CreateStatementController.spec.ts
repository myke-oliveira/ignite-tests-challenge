import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import request from "supertest";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Create statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("create statement user password", 8);

    await connection.query(
      `INSERT INTO users (id, name, email, password)
      VALUES('${id}', 'create statement user', 'createstatementuser@finapi.com.br', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new deposit", async () => {
    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "createstatementuser@finapi.com.br",
        password: "create statement user password",
      });

    const token = authenticationResponse.body.token;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Deposit description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(typeof response.body.id).toBe('string');
    expect(typeof response.body.user_id).toBe('string');
    expect(typeof response.body.description).toBe('string');
    expect(typeof response.body.amount).toBe('number');
    expect(typeof response.body.type).toBe('string');
    expect(typeof response.body.created_at).toBe('string');
    expect(typeof response.body.updated_at).toBe('string');
  });

  it("should be able to create a new withdraw", async () => {
    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "createstatementuser@finapi.com.br",
        password: "create statement user password",
      });

    const token = authenticationResponse.body.token;

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Deposit description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseDeposit.status).toBe(201);
    expect(typeof responseDeposit.body.id).toBe("string");
    expect(typeof responseDeposit.body.user_id).toBe("string");
    expect(typeof responseDeposit.body.description).toBe("string");
    expect(typeof responseDeposit.body.amount).toBe("number");
    expect(typeof responseDeposit.body.type).toBe("string");
    expect(typeof responseDeposit.body.created_at).toBe("string");
    expect(typeof responseDeposit.body.updated_at).toBe("string");

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 200,
        description: "Whidraw description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.status).toBe(201);
    expect(typeof responseWithdraw.body.id).toBe("string");
    expect(typeof responseWithdraw.body.user_id).toBe("string");
    expect(typeof responseWithdraw.body.description).toBe("string");
    expect(typeof responseWithdraw.body.amount).toBe("number");
    expect(typeof responseWithdraw.body.type).toBe("string");
    expect(typeof responseWithdraw.body.created_at).toBe("string");
    expect(typeof responseWithdraw.body.updated_at).toBe("string");
  });
});
