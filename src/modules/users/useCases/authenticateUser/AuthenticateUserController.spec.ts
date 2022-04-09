import { Connection } from "typeorm";

import  request from "supertest";

import { app } from "../../../../app";

import { createConnection } from "../../../../database";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

let connection: Connection;

describe("Authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO users (id, name, email, password)
      VALUES('${id}', 'admin', 'admin@finapi.com.br', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to autheticate", async () => {
    const response = await request(app).post("/").send({
      email: "admin@finapi.com.br",
      password: "admin"
    })

    expect(response.status).toBe(200);
    expect(response.body.user.name).toBe("admin");
    expect(response.body.user.email).toBe("admin@finapi.com.br");
  })
});
