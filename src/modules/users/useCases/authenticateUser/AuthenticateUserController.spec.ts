import { Connection } from "typeorm";
import  request from "supertest";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

import createConnection from "../../../../database";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("auth user password", 8);

    await connection.query(
      `INSERT INTO users (id, name, email, password)
      VALUES('${id}', 'auth user', 'auth.user@finapi.com.br', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "auth.user@finapi.com.br",
      password: "auth user password",
    });

    expect(response.status).toBe(200);
    expect(response.body.user.name).toBe("auth user");
    expect(response.body.user.email).toBe("auth.user@finapi.com.br");
  });

  it("should not be able to authenticate user with wrong password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "authenticatetesteuser@finapi.com.br",
      password: "wrong",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate user with wrong email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "wrong@finapi.com.br",
      password: "admin",
    });

    expect(response.status).toBe(401);
  });
});
