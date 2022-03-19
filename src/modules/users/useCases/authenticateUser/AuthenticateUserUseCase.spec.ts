import { validate } from "uuid";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { verify } from "jsonwebtoken";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate user", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });
  it("should be able to authenticate user", async () => {
    await createUserUseCase.execute({
      name: "User Name",
      email: "user.name@server.com",
      password: "user password",
    });

    const authentication = await authenticateUserUseCase.execute({
      email: "user.name@server.com",
      password: "user password",
    });

    expect(validate(authentication.user.id || "")).toBeTruthy();
    expect(authentication.user.name).toBe("User Name");
    expect(authentication.user.email).toBe("user.name@server.com");
    expect(verify(authentication.token, process.env.JWT_SECRET || ""))
      .toBeTruthy;
  });

  it("should not authenticate a non-existing user", () => {
    expect(async () => {
      authenticateUserUseCase.execute({
        email: "non-existing.user.name@server.com",
        password: "user password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not authenticate user with wrong password", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Name2",
        email: "user.name2@server.com",
        password: "user password",
      });
      await authenticateUserUseCase.execute({
        email: "user.name2@server.com",
        password: "wrong user password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
