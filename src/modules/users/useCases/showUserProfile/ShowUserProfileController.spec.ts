import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import request from "supertest";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Show user profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const userId = uuidV4();
    const password = await hash("show user profile controller", 8);

    await connection.query(
      `INSERT INTO users (id, name, email, password)
      VALUES('${userId}', 'show user profile controller', 'showuserprofilecontroller@finapi.com.br', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "showuserprofilecontroller@finapi.com.br",
        password: "show user profile controller",
      });

    const token = authenticationResponse.body.token;

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.id).toBe('string');
    expect(typeof response.body.name).toBe('string');
    expect(typeof response.body.email).toBe('string');
    expect(typeof response.body.created_at).toBe('string');
    expect(typeof response.body.updated_at).toBe('string');

  });
});
